"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

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
        // First, delete all slides associated with the presentation
        const { error: slidesError } = await supabase
          .from('slides')
          .delete()
          .eq('presentation_id', presentationId);

        if (slidesError) {
          console.error("Error deleting slides:", slidesError);
          return;
        }

        // Then, delete the presentation itself
        const { error: presentationError } = await supabase
          .from('presentations')
          .delete()
          .eq('id', presentationId);

        if (presentationError) {
          console.error("Error deleting presentation:", presentationError);
          return;
        }

        // If both operations are successful, update the local state
        setPresentations(presentations.filter(p => p.id !== presentationId));
      } catch (error) {
        console.error("Error during deletion process:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Presentations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentations.map((presentation) => (
          <div key={presentation.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
            <Link href={`/editor/${presentation.id}`}>
              <h2 className="text-xl font-semibold mb-2">{presentation.title}</h2>
              <p className="text-gray-600">
                Created: {new Date(presentation.created_at).toLocaleDateString()}
              </p>
            </Link>
            <button
              onClick={() => handleDelete(presentation.id)}
              className="mt-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        <Link href="/editor/new">
          <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow flex items-center justify-center">
            <span className="text-2xl">+ New Presentation</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
