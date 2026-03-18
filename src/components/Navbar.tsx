import { usePrivy } from '@privy-io/react-auth';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Hexagon, Rocket, PenTool, LayoutDashboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', label: 'Home', icon: Hexagon },
  { to: '/deploy', label: 'Deploy', icon: Rocket },
  { to: '/signatures', label: 'Signatures', icon: PenTool },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function Navbar() {
  const location = useLocation();
  const { login, logout, authenticated, user } = usePrivy();

  const displayAddress = user?.wallet?.address
    ? `${user.wallet.address.slice(0, 6)}…${user.wallet.address.slice(-4)}`
    : user?.email?.address
    ? user.email.address
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Hexagon className="h-5 w-5 text-primary" />
            <span className="text-sm">EVVM <span className="text-muted-foreground font-normal">ichiban</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  location.pathname === item.to
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {authenticated ? (
          <div className="flex items-center gap-2">
            {displayAddress && (
              <span className="text-xs text-muted-foreground font-mono">{displayAddress}</span>
            )}
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={logout}>
              <LogOut className="h-3 w-3" />
              Logout
            </Button>
          </div>
        ) : (
          <Button size="sm" className="h-8 text-xs" onClick={login}>
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
