"use client"
import {Button, Card, CardBody, Input} from "@heroui/react";
import { Search, Globe, Zap} from "lucide-react";
import HomeFeatureDesc from "@/components/homeFeatureDesc";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <div className="mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Accessibility Analyzer</h1>
        </div>
        <p className="text-lg text-default-600 max-w-2xl">
          Analyze your website for accessibility issues and get actionable insights 
          to make your site more inclusive for everyone.
        </p>
      </div>
      
      <Card className="max-w-md w-full shadow-lg">
        <CardBody className="gap-4">
          <Input
            type="url"
            label="Website URL"
            placeholder="https://yourwebsite.com"
            size="lg"
            variant="bordered"
            startContent={
              <Globe className="w-5 h-5 text-default-400 pointer-events-none flex-shrink-0" />
            }
          />
          <Button 
            color="primary" 
            size="lg" 
            className="w-full font-semibold"
            startContent={<Search className="w-5 h-5" />}
          >
            Analyze Website
          </Button>
        </CardBody>
      </Card>
      <HomeFeatureDesc/>
    </div>
  );
}