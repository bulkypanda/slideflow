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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Presentations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {presentations.map((presentation) => (
          <Link href={`/editor/${presentation.id}`} key={presentation.id}>
            <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{presentation.title}</h2>
              <p className="text-gray-600">
                Created: {new Date(presentation.created_at).toLocaleDateString()}
              </p>
            </div>
          </Link>
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
