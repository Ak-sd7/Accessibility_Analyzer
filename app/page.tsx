"use client"
import {Button, Card, CardBody, Input} from "@heroui/react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Accessibility Analyzer</h1>
      <p className="text-lg text-default-600 mb-8 max-w-2xl">
        Analyze your website for accessibility issues and get actionable insights 
        to make your site more inclusive for everyone.
      </p>
      
      <Card className="max-w-lg w-full">
        <CardBody className="gap-4">
          <Input
            type="url"
            label="Website URL"
            placeholder="https://yourwebsite.com"
            size="lg"
            variant="bordered"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">🔍</span>
              </div>
            }
          />
          <Button color="primary" size="lg" className="w-full">
            Analyze Accessibility
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
