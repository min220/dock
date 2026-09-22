-- CreateTable
CREATE TABLE "Berth" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lengthFeet" INTEGER NOT NULL,

    CONSTRAINT "Berth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "berthId" INTEGER NOT NULL,
    "vesselName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isEvent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Berth_name_key" ON "Berth"("name");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_berthId_fkey" FOREIGN KEY ("berthId") REFERENCES "Berth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
