"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Presentations() {
  const { user } = useUser();
  const [presentations, setPresentations] = useState([]);

  useEffect(() => {
    async function fetchPresentations() {
      if (user) {
        const { data, error } = await supabase
          .from('presentations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching presentations:", error);
        } else {
          setPresentations(data);
        }
      }
    }

    fetchPresentations();
  }, [user]);

  const handleDelete = async (presentationId) => {
    if (window.confirm('Are you sure you want to delete this presentation?')) {
      try {
        const { error: slidesError } = await supabase
          .from('slides')
          .delete()
          .eq('presentation_id', presentationId);

        if (slidesError) {
          console.error("Error deleting slides:", slidesError);
          return;
        }

        const { error: presentationError } = await supabase
          .from('presentations')
          .delete()
          .eq('id', presentationId);

        if (presentationError) {
          console.error("Error deleting presentation:", presentationError);
          return;
        }

        setPresentations(presentations.filter(p => p.id !== presentationId));
      } catch (error) {
        console.error("Error during deletion process:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* <h1 className="text-4xl font-bold mb-8 text-center">Your Presentations</h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link href="/editor/new" className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 h-full flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors">
            <PlusCircle className="w-12 h-12 mb-4" />
            <span className="text-xl font-semibold">Create New Presentation</span>
          </div>
        </Link>
        {presentations.map((presentation) => (
          <div key={presentation.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-105">
            <Link href={`/editor/${presentation.id}`}>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2 truncate">{presentation.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created: {new Date(presentation.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 flex justify-between items-center">
              <Link href={`/editor/${presentation.id}`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(presentation.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
