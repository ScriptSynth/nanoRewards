
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Clock, Zap, Coins, ExternalLink, Gift } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { z } from "zod";

const Index = () => {
  const [nanoAddress, setNanoAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastClaim, setLastClaim] = useState<number | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);
  const [rewardAmount, setRewardAmount] = useState("0.0000");
  const { toast } = useToast();

  const COOLDOWN_HOURS = 2;
  const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

  useEffect(() => {
    // Check for existing claim time
    const savedClaimTime = localStorage.getItem('nanorewards_last_claim');
    if (savedClaimTime) {
      const claimTime = parseInt(savedClaimTime);
      setLastClaim(claimTime);
      
      const now = Date.now();
      const timePassed = now - claimTime;
      
      if (timePassed < COOLDOWN_MS) {
        setTimeLeft(COOLDOWN_MS - timePassed);
      }
    }
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1000) {
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isValidNanoAddress = (address: string) => {
    // Basic nano address validation (starts with nano_ and has correct length)
    return address.startsWith('nano_') && address.length === 65;
  };

  const generateRandomAmount = () => {
    // Generate random amount between 0.0001 and 0.0003 NANO
    const min = 0.0001;
    const max = 0.0003;
    return (Math.random() * (max - min) + min).toFixed(6);
  };

  const handleClaim = async () => {
    if (!nanoAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your Nano address",
        variant: "destructive"
      });
      return;
    }

    if (!isValidNanoAddress(nanoAddress.trim())) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Nano address (starts with nano_)",
        variant: "destructive"
      });
      return;
    }

    if (timeLeft > 0) {
      toast({
        title: "Cooldown Active",
        description: `Please wait ${formatTime(timeLeft)} before your next claim`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Store submission in Supabase
      const { error } = await supabase
        .from('submissions')
        .insert({
          nano_address: nanoAddress.trim(),
          email: "noemail@example.com" // Default email as we don't collect it anymore
        });
      
      if (error) throw error;
      
      const amount = generateRandomAmount();
      const now = Date.now();
      
      // Save claim time to localStorage
      localStorage.setItem('nanorewards_last_claim', now.toString());
      
      setLastClaim(now);
      setTimeLeft(COOLDOWN_MS);
      setRewardAmount(amount);
      setShowCongrats(true);
      
      setNanoAddress('');
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeCongrats = () => {
    setShowCongrats(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Droplets className="w-16 h-16 text-cyan-400 animate-bounce" />
              <div className="absolute inset-0 w-16 h-16 text-cyan-400 animate-ping opacity-20">
                <Droplets className="w-16 h-16" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            NanoRewards
          </h1>
          <p className="text-gray-300 text-lg">Free Nano Faucet</p>
        </div>

        {/* Ad Banner */}
        <div className="mb-6 animate-scale-in">
          <a 
            href="https://csgoempire.com/r/Supplyclamp" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block bg-gradient-to-r from-yellow-500 to-amber-600 text-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-xl">🎮 JOIN CSGOEMPIRE TODAY!</p>
                <div className="flex items-center mt-1">
                  <Gift className="w-5 h-5 mr-1 text-yellow-200" />
                  <p className="text-white font-medium">Get FREE Case + Bonus Rewards!</p>
                </div>
              </div>
              <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-all">
                <ExternalLink className="w-6 h-6" />
              </div>
            </div>
          </a>
        </div>

        {/* Main Card */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl flex items-center justify-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              Claim Your Nano
            </CardTitle>
            <CardDescription className="text-gray-300">
              Receive between 0.0001 nano to 0.0003 nano - try your luck!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Cooldown Timer */}
            {timeLeft > 0 && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center animate-fade-in">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  <span className="text-orange-400 font-semibold">Cooldown Active</span>
                </div>
                <div className="text-2xl font-mono text-white">
                  {formatTime(timeLeft)}
                </div>
                <p className="text-gray-300 text-sm mt-1">until next claim</p>
              </div>
            )}

            {/* Input */}
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Nano Address</label>
              <Input
                placeholder="nano_1234567890abcdef..."
                value={nanoAddress}
                onChange={(e) => setNanoAddress(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                disabled={isLoading || timeLeft > 0}
              />
            </div>

            {/* Claim Button */}
            <Button
              onClick={handleClaim}
              disabled={isLoading || timeLeft > 0 || !nanoAddress.trim()}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </div>
              ) : timeLeft > 0 ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Cooldown Active
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Claim Nano
                </div>
              )}
            </Button>

            {/* Info */}
            <div className="text-center space-y-2">
              <p className="text-gray-300 text-sm">
                ⏱️ One claim every {COOLDOWN_HOURS} hours
              </p>
              <p className="text-gray-400 text-xs">
                Payouts are processed manually after review
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 animate-fade-in">
          <p className="text-gray-400 text-sm">
            Powered by NanoRewards • Free Nano for Everyone
          </p>
        </div>
      </div>

      {/* Congratulations Alert Dialog */}
      <AlertDialog open={showCongrats} onOpenChange={closeCongrats}>
        <AlertDialogContent className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              🎉 Congratulations! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/90 text-center text-lg">
              You have received <span className="font-bold text-yellow-200">{rewardAmount}</span> NANO!
              <p className="mt-2">Your rewards will be sent to your wallet after manual review.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full bg-white text-blue-600 hover:bg-gray-100">
              Awesome!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
