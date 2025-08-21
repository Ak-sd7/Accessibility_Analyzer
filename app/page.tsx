"use client"
import {Button, Card, CardBody, Input} from "@heroui/react";
import { Search, Globe, Zap} from "lucide-react";
import HomeFeatureDesc from "@/components/homeFeatureDesc";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function Home() {
  const [url, setUrl] = useState<String>("");

  const submitHandler = async(e:any)=>{  
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `api/scrape`,
        { url },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
    } catch (err: unknown) {
      let errorMessage = 'An error occurred';
  
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as any).response;
        errorMessage = response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    }
  }

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
            placeholder="https://website.com"
            size="lg"
            variant="bordered"
            startContent={
              <Globe className="w-5 h-5 text-default-400 pointer-events-none flex-shrink-0" />
            }
            onChange={(e)=>{setUrl(e.target.value)}}
          />
          <Button 
            color="primary" 
            size="lg" 
            className="w-full font-semibold"
            startContent={<Search className="w-5 h-5" />}
            onPress = {submitHandler}
          >
            Analyze Website
          </Button>
        </CardBody>
      </Card>
      <HomeFeatureDesc/>
    </div>
  );
}