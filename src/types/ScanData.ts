export enum ScanStatus {
  SCAN_STATUS_WAITING,
  SCAN_STATUS_SCANNED,
  SCAN_STATUS_CONFIRMED,
  SCAN_STATUS_TIMEOUT
}
export interface ScanData {
  qrcode: string
  status: ScanStatus
  url: string
}
