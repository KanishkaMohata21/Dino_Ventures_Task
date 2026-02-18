import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { VideoProvider } from "@/contexts/VideoContext";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import NotFound from "./pages/NotFound";
import { GlobalVideoPlayer } from "@/components/GlobalVideoPlayer";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VideoProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <GlobalVideoPlayer />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </VideoProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
