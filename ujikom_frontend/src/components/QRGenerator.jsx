import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const QRGenerator = () => {
  const [qrCode, setQRCode] = useState('');
  
  const generateQR = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/generate-qr');
      setQRCode(response.data.qrCode);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  useEffect(() => {
    // Generate QR setiap 4.5 menit
    generateQR();
    const interval = setInterval(generateQR, 270000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>QR Code Absensi</h2>
      {qrCode && <img src={qrCode} alt="QR Code" />}
    </div>
  );
};

export default QRGenerator;