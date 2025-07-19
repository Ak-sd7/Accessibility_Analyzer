import { Search, Globe, Zap, Volume2, Crown, Sparkles } from "lucide-react";

const HomeFeatureDesc = () => {
  return (
	<div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-success" />
          </div>
          <h3 className="font-semibold mb-1">Quick Analysis</h3>
          <p className="text-sm text-default-600">Get instant feedback on accessibility issues</p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-warning" />
          </div>
          <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
          <p className="text-sm text-default-600">Receive smart recommendations with AI analysis</p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="font-semibold mb-1">Web Standards</h3>
          <p className="text-sm text-default-600">Ensure compliance with WCAG guidelines</p>
        </div>

        <div className="text-center p-4 relative">
          <div className="absolute -top-1 -right-1">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-3 h-3" />
              <span>PRO</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-200 to-white rounded-full flex items-center justify-center mx-auto mb-3">
            <Volume2 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold mb-1 flex items-center justify-center gap-1">
            Audio Analysis 
            <Sparkles className="w-4 h-4 text-purple-500" />
          </h3>
          <p className="text-sm text-default-600">AI-powered audio content accessibility analysis</p>
        </div>
    </div>
  )
}

export default HomeFeatureDesc;
