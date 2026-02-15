"use client";

import { CodeExampleCard } from "@/components/docs/code-example-card";
import { CollapsibleSection } from "@/components/docs/collapsible-section";
import {
  CURL_VISION_SEGMENT_IMAGE_TEXT,
  CURL_VISION_SEGMENT_IMAGE_POINTS,
  CURL_VISION_SEGMENT_IMAGE_BOX,
  PYTHON_VISION_EXAMPLE,
  CURL_VISION_ANALYZE_HOME_PHOTO,
  PYTHON_VISION_ANALYZE_HOME_PHOTO,
} from "@/components/docs/docs-constants";

type Props = {
  icon: React.ComponentType<{ className?: string }>;
  copiedCode: string | null;
  onCopyCode: (code: string, id: string) => void;
};

export function VisionSection({
  icon: Icon,
  copiedCode,
  onCopyCode,
}: Props) {
  return (
    <CollapsibleSection
      id="vision"
      title="Vision Service (SAM 3)"
      icon={Icon}
      description="Image and video segmentation using Meta's Segment Anything Model 3 (SAM 3) with text prompts, points, and bounding boxes."
      defaultOpen={false}
    >
      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          "Text-based segmentation",
          "Point & box prompts",
          "Video tracking",
          "Open-vocabulary",
        ].map((feat) => (
          <span
            key={feat}
            className="px-3 py-1 text-xs font-medium rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40"
          >
            {feat}
          </span>
        ))}
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            1. Image Segmentation — Text Prompt
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            SAM 3&apos;s main feature: segment objects using natural language descriptions.
          </p>
          <CodeExampleCard
            title="POST /vision/v1/segment-image — with text_prompt"
            code={CURL_VISION_SEGMENT_IMAGE_TEXT}
            copyId="curl-vision-text"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            2. Image Segmentation — Point Prompt
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Click on an object to segment it. Points are in [x, y] format, labels are 1 (foreground) or 0 (background).
          </p>
          <CodeExampleCard
            title="POST /vision/v1/segment-image — with input_points"
            code={CURL_VISION_SEGMENT_IMAGE_POINTS}
            copyId="curl-vision-points"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            3. Image Segmentation — Bounding Box
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Draw a box around the object. Format: [x1, y1, x2, y2] (top-left to bottom-right).
          </p>
          <CodeExampleCard
            title="POST /vision/v1/segment-image — with input_box"
            code={CURL_VISION_SEGMENT_IMAGE_BOX}
            copyId="curl-vision-box"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            4. Home Photo Analysis — Roofline Detection
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Specialized endpoint for analyzing home photos to detect rooflines and suggest product placements (gutters, rain chains, tanks). Returns normalized coordinates for Unity/AR applications.
          </p>
          <CodeExampleCard
            title="POST /vision/v1/analyze-home-photo"
            code={CURL_VISION_ANALYZE_HOME_PHOTO}
            copyId="curl-vision-home-photo"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
          <div className="mt-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 text-xs">
            <p className="text-gray-600 dark:text-gray-400 mb-2"><strong>Response format:</strong></p>
            <pre className="text-xs overflow-x-auto">
{`{
  "success": true,
  "rooflines": [
    {
      "id": "roof1",
      "points": [[0.1, 0.3], [0.5, 0.28], [0.9, 0.32]]
    }
  ],
  "suggested_gutters": [
    {"roofline_id": "roof1", "style": "k-style"}
  ],
  "suggested_rain_chains": [
    {"position": [0.1, 0.3], "connects_to": "roof1"}
  ],
  "suggested_tank": {"position": [0.92, 0.9]},
  "ground_level": 0.9
}`}
            </pre>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Python Example — Image Segmentation
          </h3>
          <CodeExampleCard
            title="Using the Vision API with Python"
            code={PYTHON_VISION_EXAMPLE}
            copyId="python-vision"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Python Example — Home Photo Analysis
          </h3>
          <CodeExampleCard
            title="Analyzing home photos with Python"
            code={PYTHON_VISION_ANALYZE_HOME_PHOTO}
            copyId="python-vision-home-photo"
            copiedCode={copiedCode}
            onCopy={onCopyCode}
          />
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mt-6">
          <p className="text-sm text-blue-600 dark:text-blue-300">
            <strong>Note:</strong> Video segmentation endpoints are available at{" "}
            <code className="bg-blue-500/20 px-1.5 py-0.5 rounded text-xs">/vision/v1/segment-video/init</code>,{" "}
            <code className="bg-blue-500/20 px-1.5 py-0.5 rounded text-xs">/vision/v1/segment-video/add-prompt</code>, and{" "}
            <code className="bg-blue-500/20 px-1.5 py-0.5 rounded text-xs">/vision/v1/segment-video/propagate</code>.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
