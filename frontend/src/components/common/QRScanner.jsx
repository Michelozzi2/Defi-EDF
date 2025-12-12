import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QRScanner = ({ onScanSuccess, onClose, onError }) => {
    const scannerRef = useRef(null);
    const [scanError, setScanError] = useState(null);

    useEffect(() => {
        // Initialize scanner
        // We use a timeout to ensure the DOM element exists and modal animation is done
        const timer = setTimeout(() => {
            // Cleanup any existing instance
            const element = document.getElementById("reader");
            if (!element) return;

            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
                },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    scanner.clear();
                    onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore transient scanning errors
                    // if (onError) onError(errorMessage);
                }
            );

            scannerRef.current = scanner;

        }, 300); // Wait for modal animation

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-[#16202A] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 relative"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#0F1720]">
                    <div className="flex items-center gap-2 text-[#001A70] dark:text-white font-bold">
                        <Camera size={20} className="text-[#FE5815]" />
                        <span>Scanner un QR Code</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Scanner Area */}
                <div className="p-6 bg-black relative min-h-[350px] flex items-center justify-center">
                    <div id="reader" className="w-full"></div>

                    {/* Custom Overlay (Optional styling tweaks often needed for html5-qrcode) */}
                    <style>{`
                        #reader { border: none !important; }
                        #reader__scan_region { background: transparent !important; }
                        #reader__dashboard_section_csr span { display: none !important; } 
                        #reader__dashboard_section_swaplink { display: none !important; }
                    `}</style>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-[#0F1720] text-center text-sm text-gray-500">
                    Placez le QR Code dans le cadre
                </div>
            </motion.div>
        </div>
    );
};

export default QRScanner;
