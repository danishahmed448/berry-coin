import React, { useRef, useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useBerryBalance } from '../hooks/useBerryBalance';
import { TOKEN_TICKER } from '../constants';

export const WantedPosterGenerator: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const { balance } = useBerryBalance();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userName, setUserName] = useState<string>('');
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pirateNickname, setPirateNickname] = useState<string>('');

  // Handle file upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Simple "Pirate Nickname" generator based on address
  const generateNickname = () => {
    const adjectives = ["Mad", "Iron", "Red", "Golden", "Savage", "Drunken", "Cursed"];
    const nouns = ["Beard", "Jack", "Sparrow", "Viper", "Shark", "Cannon", "Ghost"];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    setPirateNickname(`${randomAdjective} ${randomNoun}`);
  };

  useEffect(() => {
    if (connected && publicKey && !pirateNickname) {
      generateNickname();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  // Draw the canvas
  const drawPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = 600;
    canvas.height = 850;

    // 1. Draw Background (Parchment)
    ctx.fillStyle = '#f0e6d2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add texture noise
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // 2. Text: WANTED
    ctx.fillStyle = '#3e2723';
    ctx.font = '900 80px "serif"'; // Fallback to serif if custom font fails to load in canvas
    ctx.textAlign = 'center';
    ctx.fillText('WANTED', canvas.width / 2, 130);

    ctx.font = 'bold 30px "serif"';
    ctx.fillText('DEAD OR ALIVE', canvas.width / 2, 175);

    // 3. User Image Area
    const imgX = 75;
    const imgY = 210;
    const imgW = 450;
    const imgH = 350;

    ctx.strokeRect(imgX, imgY, imgW, imgH);

    if (userImage) {
      const img = new Image();
      img.src = userImage;
      img.onload = () => {
        // Draw image keeping aspect ratio cover
        // For simplicity in this example, we stretch to fit or center
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
        finalizeText(ctx, canvas);
      };
      // If cached
      if (img.complete) {
        ctx.drawImage(img, imgX, imgY, imgW, imgH);
        finalizeText(ctx, canvas);
      }
    } else {
      // Placeholder Silhouette
      ctx.fillStyle = '#ccc';
      ctx.fillRect(imgX, imgY, imgW, imgH);
      ctx.fillStyle = '#666';
      ctx.font = '30px serif';
      ctx.fillText('NO IMAGE', canvas.width / 2, imgY + imgH / 2);
      finalizeText(ctx, canvas);
    }
  };

  const finalizeText = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // 4. Name & Bounty
    ctx.fillStyle = '#3e2723';
    ctx.textAlign = 'center';

    // Name
    ctx.font = 'bold 50px serif';
    const displayIdentifier = userName || pirateNickname || "UNKNOWN PIRATE";
    ctx.fillText(displayIdentifier.toUpperCase(), canvas.width / 2, 630);

    // Label
    ctx.font = '30px serif';
    ctx.fillText('REWARD', canvas.width / 2, 690);

    // Bounty Amount - Auto Scaling
    const bountyText = `₿ ${balance !== null ? balance.toLocaleString() : '0'}`;
    let fontSize = 50;
    const maxWidth = 500; // Max width for the text

    ctx.font = `bold ${fontSize}px serif`;
    while (ctx.measureText(bountyText).width > maxWidth && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px serif`;
    }

    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(bountyText, canvas.width / 2, 750);

    // Reset shadow for other elements if needed, or keep it for footer
    ctx.shadowColor = "transparent";

    // Footer
    ctx.font = 'italic 20px serif';
    ctx.fillText('MARINE HEADQUARTERS - SOLANA DIVISION', canvas.width / 2, 800);
  };

  useEffect(() => {
    // Initial draw
    drawPoster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userImage, userName, pirateNickname, balance]);

  const downloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const safeName = (userName || 'pirate').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const link = document.createElement('a');
    link.download = `wanted-${safeName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const openWalletModal = () => setVisible(true);
  const imageLoaded = !!userImage;

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl mx-auto p-8 bg-black/30 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 relative overflow-hidden">

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* Controls Section */}
          <div className="w-full md:w-1/2 space-y-6 bg-black/20 p-6 rounded-lg border border-white/5">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-pirate text-pirate-gold tracking-wide drop-shadow-md">Bounty Board</h2>
              <p className="text-pirate-parchment font-body text-sm font-bold opacity-80">Create your official warrant</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-pirate-gold mb-1 uppercase tracking-wider">Pirate Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Captain Jack"
                  className="w-full px-4 py-3 bg-black/50 border border-pirate-gold/30 rounded-lg focus:outline-none focus:border-pirate-gold text-pirate-parchment font-pirate text-xl placeholder-gray-600 shadow-inner transition-colors"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-pirate-gold mb-1 uppercase tracking-wider">Upload Portrait</label>
                <div className="relative border-2 border-dashed border-pirate-gold/30 rounded-lg p-4 hover:border-pirate-gold transition-colors text-center cursor-pointer bg-black/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-pirate-parchment font-body text-sm opacity-80">Click to upload image</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-black/50 p-4 px-2 rounded-lg border border-pirate-gold/20 gap-2">
                <span className="text-sm font-bold text-pirate-gold uppercase tracking-wider">Current Bounty</span>
                <div className="w-full text-center whitespace-nowrap overflow-hidden">
                  <span className="font-mono font-bold text-[3.5vw] sm:text-[3vw] md:text-[2.2vw] lg:text-[1.8vw] xl:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 drop-shadow-sm inline-block">
                    {connected ? (balance !== null ? `₿ ${balance.toLocaleString()}` : 'Loading...') : 'Connect Wallet'}
                  </span>
                </div>
              </div>

              {!connected ? (
                <button
                  onClick={openWalletModal}
                  className="w-full py-4 bg-pirate-dark text-pirate-gold font-bold rounded-lg uppercase tracking-widest hover:bg-black hover:text-white border border-pirate-gold transition-all shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.5)]"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  onClick={downloadPoster}
                  disabled={!imageLoaded || !balance || balance <= 0}
                  className="w-full py-4 bg-gradient-to-b from-pirate-gold to-[#b8860b] text-pirate-dark font-black rounded-lg uppercase tracking-widest hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed border border-[#fffacd] shadow-lg transform active:scale-95 transition-all hover:shadow-[0_0_20px_#ffd700]"
                >
                  {(!balance || balance <= 0) ? "Get $BERRY to Join Crew" : "Download Poster"}
                </button>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-full md:w-1/2 flex justify-center relative">
            {/* Paper texture behind canvas */}
            <div className="absolute inset-0 bg-[#d4c4a8] transform rotate-1 shadow-xl rounded-sm -z-10"></div>
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto shadow-2xl rounded-sm border-4 border-[#2a1a10] transform -rotate-1 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};