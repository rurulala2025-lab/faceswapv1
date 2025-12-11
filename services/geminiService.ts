import { GoogleGenAI } from "@google/genai";
import { UploadedImage } from "../types";

export const generateFaceSwap = async (
  sourceFace: UploadedImage,
  targetBody: UploadedImage,
  userPrompt: string = "",
  aspectRatio: string = "1:1",
  imageSize: string = "2K",
  skinTone: string = "match_target",
  lightingMode: string = "natural",
  faceScale: string = "default",
  customApiKey?: string
): Promise<string> => {
  try {
    // Priority: 1. Key passed by user (web input) 2. Key from environment (deployment var)
    const apiKey = customApiKey || (typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined);

    if (!apiKey) {
      throw new Error("API Key is missing. Please enter your Google Gemini API Key in the settings.");
    }
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Model selection: 'gemini-3-pro-image-preview' (Nano Banana Pro / Gemini Pro Image)
    const model = 'gemini-3-pro-image-preview';

    // Construct dynamic instructions based on user preferences
    let toneInstruction = "Critically important: Maintain the lighting, shadows, and skin tone of the Target Body to ensure a seamless blend.";
    if (skinTone === 'preserve_source') {
      toneInstruction = "Preserve the original skin tone and texture of the Source Face as much as possible, while blending the edges naturally into the Target Body.";
    } else if (skinTone === 'lighter') {
      toneInstruction = "Adjust the generated face skin tone to be lighter/brighter than the target, giving it a high-key look.";
    } else if (skinTone === 'darker') {
      toneInstruction = "Adjust the generated face skin tone to be darker/richer than the target, giving it a deep tone.";
    }

    let lightInstruction = "Ensure the lighting direction on the face matches the Target Body exactly.";
    if (lightingMode === 'warm') {
      lightInstruction = "Apply a warm, golden color temperature to the face, simulating sunset or indoor warm lighting.";
    } else if (lightingMode === 'cool') {
      lightInstruction = "Apply a cool, bluish color temperature to the face, simulating fluorescent or night lighting.";
    } else if (lightingMode === 'contrast') {
      lightInstruction = "Increase the contrast on the face for a dramatic, cinematic look.";
    }

    let scaleInstruction = "Ensure perfect anatomical proportions. The size of the face features must match the skull size of the Target Body.";
    if (faceScale === 'smaller') {
      scaleInstruction = "Reduce the scale of the facial features (eyes, nose, mouth) slightly (approx 90%) relative to the head size. Ensure the face does not look too large for the skull.";
    } else if (faceScale === 'larger') {
      scaleInstruction = "Increase the scale of the facial features slightly (approx 110%) to fill the face area more fully. Ensure the face does not look too small.";
    }

    const promptText = `
      Perform a high-quality, realistic face swap.
      
      Inputs:
      1. Source Face: The face to be used (features, eyes, nose, mouth, skin texture).
      2. Target Body: The recipient body/head (head shape, hair, pose, lighting, background).
      
      Instructions:
      - Replace the face in the Target Body image with the face from Source Face.
      - ${scaleInstruction}
      - ${toneInstruction}
      - ${lightInstruction}
      - Preserve the expression of the Source Face if possible, adapted to the Target's angle.
      - Output a photorealistic image.
      
      ${userPrompt ? `Additional User Instruction: ${userPrompt}` : ''}
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: sourceFace.mimeType,
              data: sourceFace.base64Data,
            },
          },
          {
            inlineData: {
              mimeType: targetBody.mimeType,
              data: targetBody.base64Data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        // Nano Banana Pro supports imageSize configuration
        imageConfig: {
          imageSize: imageSize,
          aspectRatio: aspectRatio
        }
      }
    });

    let generatedImageUrl = "";

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            generatedImageUrl = `data:image/png;base64,${base64EncodeString}`;
            break; // Found the image, exit loop
          }
        }
      }
    }

    if (!generatedImageUrl) {
      // Check if there was text output indicating refusal or safety block
      const textOutput = response.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
      if (textOutput) {
        throw new Error(`Model returned text instead of image: ${textOutput}`);
      }
      throw new Error("No image data found in the response. The model may have been blocked by safety filters.");
    }

    return generatedImageUrl;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Propagate the original error so App.tsx can handle specific status codes (like 403)
    throw error;
  }
};