import { formatCurrency } from "./lib";
import type { Payslip } from "./types";

export async function downloadPayslipPdf(slip: Payslip) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const left = 18; const right = 192;
  pdf.setFillColor(18, 38, 65); pdf.rect(0, 0, 210, 35, "F");
  pdf.setTextColor(255,255,255); pdf.setFont("helvetica","bold"); pdf.setFontSize(18); pdf.text("RekaHR",left,16);
  pdf.setFontSize(8); pdf.setFont("helvetica","normal"); pdf.text("REKA ALUR TEKNOLOGI",left,23); pdf.text("SLIP GAJI",right,16,{align:"right"}); pdf.text(slip.period,right,23,{align:"right"});
  pdf.setTextColor(33,49,73); pdf.setFontSize(9); pdf.setFont("helvetica","normal"); pdf.text("Nama karyawan",left,48); pdf.text("ID karyawan",95,48); pdf.text("Periode",150,48);
  pdf.setFont("helvetica","bold"); pdf.setFontSize(11); pdf.text(slip.employeeName,left,55); pdf.text(slip.employeeCode,95,55); pdf.text(slip.period,150,55);
  let y=70; const line=(label:string,value:number,minus=false)=>{pdf.setFont("helvetica","normal");pdf.setFontSize(9);pdf.text(label,left,y);pdf.setFont("helvetica","bold");pdf.text(`${minus?"- ":""}${formatCurrency(value)}`,right,y,{align:"right"});y+=8;};
  pdf.setDrawColor(220,226,234); pdf.line(left,y-4,right,y-4); pdf.setFont("helvetica","bold"); pdf.text("PENGHASILAN",left,y+2); y+=11;
  line("Gaji pokok",slip.baseSalary); line("Tunjangan tetap",slip.allowance); line("Tunjangan kehadiran",slip.attendanceAllowance); line("Lembur",slip.overtime); line("Reimbursement",slip.reimbursement||0); line("Penghasilan bruto",slip.gross);
  pdf.line(left,y-4,right,y-4); pdf.text("POTONGAN",left,y+2); y+=11;
  line("BPJS Kesehatan (pekerja)",slip.bpjsHealth||0,true); line("BPJS Ketenagakerjaan (pekerja)",slip.bpjsEmployment||0,true); line("PPh Pasal 21",slip.incomeTax||0,true); line("Total potongan",slip.deduction,true);
  pdf.setFillColor(18,38,65); pdf.roundedRect(left,y,right-left,24,3,3,"F"); pdf.setTextColor(255,255,255); pdf.setFontSize(9); pdf.text("TAKE HOME PAY",left+7,y+10); pdf.setFontSize(16); pdf.text(formatCurrency(slip.net),right-7,y+15,{align:"right"});
  y+=35; pdf.setTextColor(110,125,143); pdf.setFont("helvetica","normal"); pdf.setFontSize(7); const note="Dokumen dibuat otomatis oleh RekaHR berdasarkan data payroll yang telah dipublikasikan dan hanya ditujukan untuk pemilik akun."; pdf.text(pdf.splitTextToSize(note,right-left),left,y); pdf.text(`Document ID: ${slip.id}`,left,y+12);
  pdf.save(`Slip-Gaji-${slip.period}-${slip.employeeCode}.pdf`);
}
