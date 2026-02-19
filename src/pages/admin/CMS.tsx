import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/error-utils";

interface CMSContent {
  id: string;
  key: string;
  content: string;
}

const contentKeys = [
  { key: "homepage_hero_title", label: "Homepage Hero Title", description: "Main heading on the homepage" },
  { key: "homepage_hero_subtitle", label: "Homepage Hero Subtitle", description: "Subtitle text below the hero heading" },
  { key: "homepage_about", label: "Homepage About Section", description: "About text on the homepage" },
  { key: "about_page_content", label: "About Page Content", description: "Main content on the About page (use double line breaks for paragraphs)" },
  { key: "about_page_subtitle", label: "About Page Subtitle", description: "Subtitle on the About page hero section" },
  { key: "services_intro", label: "Services Introduction", description: "Introduction text on the Services page" },
  { key: "requirements_intro", label: "Requirements Introduction", description: "Introduction text on the Requirements page" },
  { key: "embassy_name", label: "Embassy Name", description: "Name displayed across the site" },
  { key: "embassy_address", label: "Embassy Address", description: "Shown on Contact, About, and Home pages" },
  { key: "embassy_phone", label: "Embassy Phone", description: "Shown on Contact, About, and Home pages" },
  { key: "embassy_email", label: "Embassy Email", description: "Shown on Contact, About, and Home pages" },
  { key: "embassy_hours", label: "Embassy Hours", description: "Shown on Contact, About, and Home pages" },
  { key: "track_hero_title", label: "Track Page Hero Title", description: "Main heading on the Track Application page" },
  { key: "track_hero_subtitle", label: "Track Page Hero Subtitle", description: "Subtitle on the Track Application page" },
  { key: "track_form_title", label: "Track Form Title", description: "Title above the search form" },
  { key: "track_form_description", label: "Track Form Description", description: "Description text below the form title" },
  { key: "track_button_text", label: "Track Button Text", description: "Text on the track/search button" },
  { key: "track_help_email", label: "Track Help Email", description: "Email shown in the help section" },
  { key: "track_help_phone", label: "Track Help Phone", description: "Phone shown in the help section" },
  { key: "track_help_hours", label: "Track Help Hours", description: "Office hours shown in the help section" },
  { key: "apply_hero_title", label: "Apply Page Hero Title", description: "Main heading on the Apply for Visa page" },
  { key: "apply_hero_subtitle", label: "Apply Page Hero Subtitle", description: "Subtitle on the Apply for Visa page" },
  { key: "apply_step1_title", label: "Apply Step 1 Title", description: "Title for the Personal Information step" },
  { key: "apply_step1_description", label: "Apply Step 1 Description", description: "Description for the Personal Information step" },
  { key: "apply_step2_title", label: "Apply Step 2 Title", description: "Title for the Passport Details step" },
  { key: "apply_step2_description", label: "Apply Step 2 Description", description: "Description for the Passport Details step" },
  { key: "apply_step3_title", label: "Apply Step 3 Title", description: "Title for the Travel Information step" },
  { key: "apply_step3_description", label: "Apply Step 3 Description", description: "Description for the Travel Information step" },
  { key: "apply_step4_title", label: "Apply Step 4 Title", description: "Title for the Review & Submit step" },
  { key: "apply_step4_description", label: "Apply Step 4 Description", description: "Description for the Review & Submit step" },
  { key: "apply_submit_button", label: "Apply Submit Button Text", description: "Text on the final submit button" },
  { key: "apply_success_title", label: "Apply Success Title", description: "Heading shown after successful submission" },
  { key: "apply_success_message", label: "Apply Success Message", description: "Message shown after successful submission" },
  { key: "apply_disclaimer", label: "Apply Disclaimer", description: "Legal disclaimer text shown before submission" },
];

export default function CMS() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from("cms_content")
        .select("*");

      if (error) throw error;

      const contentMap: Record<string, string> = {};
      data?.forEach((item: CMSContent) => {
        contentMap[item.key] = item.content;
      });
      setContent(contentMap);
    } catch (error: any) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to load content"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("cms_content")
        .upsert({
          key,
          content: content[key] || "",
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "key",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Content updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error, "Failed to save content"),
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Edit website content and embassy information
        </p>
      </div>

      <div className="grid gap-6">
        {contentKeys.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>{(contentKeys.find(c => c.key === key) as any)?.description || `Key: ${key}`}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={key}>Content</Label>
                <Textarea
                  id={key}
                  value={content[key] || ""}
                  onChange={(e) =>
                    setContent({ ...content, [key]: e.target.value })
                  }
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={() => handleSave(key)}
                disabled={saving === key}
                className="w-full sm:w-auto"
              >
                {saving === key ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
