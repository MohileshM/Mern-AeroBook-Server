// Generates a 6-character alphanumeric PNR, e.g. "3KX9QF"
const generatePNR = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
};

export default generatePNR;
