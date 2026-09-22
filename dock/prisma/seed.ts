import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import path from 'path';

const prisma = new PrismaClient();

const FILE_PATH = path.join(process.cwd(), 'prisma', 'data', 'Dock-Schedule.xlsx');

const MONTHS = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

const VESSEL_PREFIXES = ['F/V', 'S/V', 'M/V', 'R/V', 'TUG'];

interface ParsedBooking {
  berthName: string;
  lengthFeet: number;
  vesselName: string;
  startDate: Date;
  endDate: Date;
  isEvent: boolean;
}

function parseBerthLabel(label: string): { name: string; lengthFeet: number } {
  const match = label.match(/^(.*)-\s*(\d+)'$/);
  if (!match) throw new Error(`Could not parse berth label: "${label}"`);
  return { name: match[1].trim(), lengthFeet: parseInt(match[2], 10) };
}

function isFilled(cell: ExcelJS.Cell): boolean {
  const fill = cell.fill as any;
  return !!fill && fill.type === 'pattern' && fill.pattern === 'solid';
}

function isVessel(text: string): boolean {
  const upper = text.toUpperCase();
  return VESSEL_PREFIXES.some((p) => upper.startsWith(p));
}

function parseSheet(worksheet: ExcelJS.Worksheet): ParsedBooking[] {
  const bookings: ParsedBooking[] = [];

  let currentYear: number | null = null;
  let currentMonth: number | null = null;
  let dayStartCol: number | null = null;

  worksheet.eachRow({ includeEmpty: true }, (row) => {
    const colA = row.getCell(1).value;

    if (typeof colA === 'string') {
      const m = colA.trim().match(/^([A-Z]+)\s+(\d{4})$/);
      if (m && MONTHS.includes(m[1])) {
        currentMonth = MONTHS.indexOf(m[1]);
        currentYear = parseInt(m[2], 10);
        dayStartCol = null;
        return;
      }
    }

    if (currentMonth !== null && dayStartCol === null) {
      for (let c = 2; c <= row.cellCount; c++) {
        if (row.getCell(c).value === 1) {
          dayStartCol = c;
          break;
        }
      }
      if (dayStartCol !== null) return;
    }

    if (typeof colA === 'string' && currentMonth !== null && dayStartCol !== null) {
      let berth;
      try {
        berth = parseBerthLabel(colA);
      } catch {
        return;
      }

      const maxCol = Math.max(row.cellCount, dayStartCol + 31);
      let col = dayStartCol;

      while (col <= maxCol) {
        if (!isFilled(row.getCell(col))) {
          col++;
          continue;
        }
        const runStartCol = col;
        let label: string | null = null;

        while (col <= maxCol && isFilled(row.getCell(col))) {
          const v = row.getCell(col).value;
          if (typeof v === 'string' && v.trim()) label = v.trim();
          col++;
        }
        const runEndCol = col - 1;

        if (label) {
          const startDay = runStartCol - dayStartCol + 1;
          const endDay = runEndCol - dayStartCol + 1;
          bookings.push({
            berthName: berth.name,
            lengthFeet: berth.lengthFeet,
            vesselName: label,
            startDate: new Date(Date.UTC(currentYear!, currentMonth!, startDay)),
            endDate: new Date(Date.UTC(currentYear!, currentMonth!, endDay)),
            isEvent: !isVessel(label),
          });
        }
      }
    }
  });

  return bookings;
}

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(FILE_PATH);

  const allBookings: ParsedBooking[] = [];

  for (const worksheet of workbook.worksheets) {
    if (!/^\d{4}$/.test(worksheet.name)) continue;
    allBookings.push(...parseSheet(worksheet));
  }

  console.log(`Parsed ${allBookings.length} bookings from the spreadsheet.`);

  const berthIdCache = new Map<string, number>();

  async function getBerthId(name: string, lengthFeet: number): Promise<number> {
    const cached = berthIdCache.get(name);
    if (cached !== undefined) return cached;
    const berth = await prisma.berth.upsert({
      where: { name },
      update: {},
      create: { name, lengthFeet },
    });
    berthIdCache.set(name, berth.id);
    return berth.id;
  }

  for (const b of allBookings) {
    const berthId = await getBerthId(b.berthName, b.lengthFeet);

    await prisma.booking.create({
      data: {
        berthId,
        vesselName: b.vesselName,
        startDate: b.startDate,
        endDate: b.endDate,
        isEvent: b.isEvent,
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
