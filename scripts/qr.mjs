// Génère le QR code qui pointe vers la page d'installation : npm run qr
import QRCode from 'qrcode'

const url = process.argv[2] ?? 'https://flying-blue-simulateur.vercel.app/app'
const options = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#1c1c1e', light: '#ffffff' } }

await QRCode.toFile('public/qr-app.png', url, { ...options, width: 1024 })
await QRCode.toFile('public/qr-app.svg', url, { ...options, type: 'svg' })
console.log('QR code généré pour', url, '→ public/qr-app.png et public/qr-app.svg')
