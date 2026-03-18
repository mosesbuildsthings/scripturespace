import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, BookOpen, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreatePostForm({ currentUser, onPostCreated, inline = false }) {
  const [content, setContent] = useState("");
  const [verseRef, setVerseRef] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showVerseInput, setShowVerseInput] = useState(false);
  const [posting, setPosting] = useState(false);
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);

    let imageUrl = "";
    if (imageFile) {
      const result = await base44.integrations.Core.UploadFile({ file: imageFile });
      imageUrl = result.file_url;
    }

    await base44.entities.Post.create({
      content: content.trim(),
      author_name: currentUser?.full_name || "User",
      author_email: currentUser?.email,
      image_url: imageUrl,
      verse_reference: verseRef,
      likes: [],
      hidden_by: [],
      comment_count: 0,
      share_count: 0,
      is_shared: false,
    });

    setContent("");
    setVerseRef("");
    setImageFile(null);
    setImagePreview(null);
    setShowVerseInput(false);
    setPosting(false);

    if (onPostCreated) {
      onPostCreated();
    } else {
      navigate("/Feed");
    }
  };

  return (
    <div className={inline ? "" : "bg-card rounded-2xl shadow-sm border p-5"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
            <span className="text-sm font-semibold text-primary">
              {(currentUser?.full_name || "U")[0].toUpperCase()}
            </span>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share what's on your heart..."
            className="min-h-[80px] text-sm border-0 bg-transparent resize-none focus-visible:ring-0 p-0"
          />
        </div>

        {/* Verse Input */}
        {showVerseInput && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Bible Verse Reference</Label>
            <Input
              value={verseRef}
              onChange={(e) => setVerseRef(e.target.value)}
              placeholder="e.g., John 3:16"
              className="text-sm"
            />
          </div>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-full rounded-xl max-h-48 object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 h-7 w-7 rounded-full"
              onClick={() => { setImageFile(null); setImagePreview(null); }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex gap-1">
            <label>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              <Button type="button" variant="ghost" size="sm" className="text-muted-foreground gap-2" asChild>
                <span>
                  <ImagePlus className="w-4 h-4" />
                  Photo
                </span>
              </Button>
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground gap-2"
              onClick={() => setShowVerseInput(!showVerseInput)}
            >
              <BookOpen className="w-4 h-4" />
              Verse
            </Button>
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={posting || !content.trim()}
            className="rounded-full px-6"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
          </Button>
        </div>
      </form>
    </div>
  );
}