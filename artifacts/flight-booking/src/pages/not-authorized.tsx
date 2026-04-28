import { Card, CardContent } from "@/components/ui/card";
import { ShieldOff } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotAuthorized() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <ShieldOff className="h-8 w-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-gray-900">Not Authorized</h1>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to view this page. This area is restricted to administrators only.
          </p>
          <Link to="/">
            <Button className="mt-6 w-full">Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
