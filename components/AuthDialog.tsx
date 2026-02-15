"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { CloudUpload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface Point {
  id: number;
  coordinates: [number, number];
  timestamp: number;
}

export default function AuthDialog({ points }: { points: Point[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle authentication logic here
    if (isLogin) {
      console.log("Login:", { email, password });
    } else {
      console.log("Create account:", { email, password, confirmPassword });
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const toggleView = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          disabled={points.length === 0}
          variant="ghost"
          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600"
          title="Cloud sync"
        >
          <CloudUpload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isLogin ? "Log In" : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {isLogin
              ? "Log in to sync your routes across devices."
              : "Create an account to save unlimited routes."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10"
              required
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                required
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLogin ? "Log In" : "Create Account"}
          </Button>
        </form>

        <div className="border-t pt-4">
          <p className="text-sm text-center text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={toggleView}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? "Create one" : "Log in"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
