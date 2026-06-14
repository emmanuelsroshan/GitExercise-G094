"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import {
  BookOpen,
  Search,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, logout, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="gradient-text">StudyConnect</span>
          </Link>

          {!loading && (
            <>
              <div className="hidden md:flex items-center gap-6">
                {user ? (
                  <>
                    <Link
                      href="/search"
                      className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      Find Tutors
                    </Link>
                    <Link
                      href="/requests"
                      className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Requests
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {user.role === "paid_tutor" && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">
                        {user.username}
                      </span>
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-1 text-sm text-muted hover:text-error transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              <button
                className="md:hidden p-2"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </>
          )}
        </div>

        {menuOpen && user && (
          <div className="md:hidden pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                href="/search"
                className="flex items-center gap-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <Search className="w-4 h-4" /> Find Tutors
              </Link>
              <Link
                href="/requests"
                className="flex items-center gap-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <MessageSquare className="w-4 h-4" /> Requests
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <User className="w-4 h-4" /> Profile
              </Link>
              {user.role === "paid_tutor" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm text-error"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
