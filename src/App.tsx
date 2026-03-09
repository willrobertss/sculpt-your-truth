import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import FilmDetail from "./pages/FilmDetail";
import Shorts from "./pages/Shorts";
import Login from "./pages/Login";
import Submit from "./pages/Submit";
import Dashboard from "./pages/Dashboard";
import CreatorProfile from "./pages/CreatorProfile";
import Admin from "./pages/Admin";
import ReferralLanding from "./pages/ReferralLanding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/film/:id" element={<FilmDetail />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/login" element={<Login />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/creators/:slug" element={<CreatorProfile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/ref/:slug" element={<ReferralLanding />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
