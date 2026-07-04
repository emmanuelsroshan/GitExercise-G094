"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  ArrowRight,
  Search,
  MessageSquare,
  Star,
  Shield,
  Zap,
  GraduationCap,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back, <span className="gradient-text">{user.username}</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Ready to continue your learning journey? Find the perfect tutor or
            help fellow students.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/search"
            className="bg-white rounded-xl p-8 border border-border card-hover text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Find a Tutor</h3>
            <p className="text-sm text-muted">
              Search for the perfect tutor by subject, availability, and rating.
            </p>
          </Link>

          <Link
            href="/requests"
            className="bg-white rounded-xl p-8 border border-border card-hover text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-lg font-semibold mb-2">My Requests</h3>
            <p className="text-sm text-muted">
              View and manage your help requests and ongoing sessions.
            </p>
          </Link>

          <Link
            href="/profile"
            className="bg-white rounded-xl p-8 border border-border card-hover text-center"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-7 h-7 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">My Profile</h3>
            <p className="text-sm text-muted">
              Update your profile, subjects, and availability schedule.
            </p>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Zap className="w-4 h-4 text-secondary" />
              <span>Smart matching powered by AI</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Your Perfect
              <span className="text-secondary"> Study Partner</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Connect with fellow students who can help you with assignments,
              exam prep, and projects. Smart matching finds the most compatible
              tutor for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-white/90 transition-all text-lg shadow-lg shadow-primary/25"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </Link>
              <Link
                href="/login"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose{" "}
              <span className="gradient-text">StudyConnect</span>?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              We make it easy to find the right academic help when you need it
              most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Subject-Matched Tutoring
              </h3>
              <p className="text-muted leading-relaxed">
                Find tutors who specialize in the exact subjects you need help
                with, from Calculus to Creative Writing.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Search className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Smart Compatibility Scores
              </h3>
              <p className="text-muted leading-relaxed">
                Our algorithm matches you with tutors based on subject,
                schedule, university, and ratings.
              </p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Built-in Chat & Reviews
              </h3>
              <p className="text-muted leading-relaxed">
                Communicate directly with your tutor and leave reviews to help
                the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Sign up as a student, volunteer tutor, or paid tutor.",
              },
              {
                step: "02",
                title: "Set Up Profile",
                desc: "Add your subjects, availability, and preferences.",
              },
              {
                step: "03",
                title: "Find Your Match",
                desc: "Search tutors and view compatibility scores.",
              },
              {
                step: "04",
                title: "Start Learning",
                desc: "Send requests, chat, and get the help you need.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-4 text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <Users className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-muted mb-8">
              Join StudyConnect today and connect with students who can help you
              succeed.
            </p>
            <Link
              href="/register"
              className="bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-dark transition-all text-lg inline-flex items-center gap-2"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted">
          <p>&copy; 2024 StudyConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
