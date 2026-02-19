export interface LeonardoGenerationResponse {
  sdGenerationJob: {
    generationId: string;
  };
}

export interface LeonardoGenerationResult {
  generations_by_pk: {
    generated_images: Array<{
      url: string;
    }>;
    status: string;
  };
}

const API_KEY = process.env.LEONARDO_API_KEY;
const BASE_URL = "https://cloud.leonardo.ai/api/rest/v1";

// Leonardo Phoenix model ID
const MODEL_ID = "de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3";

export async function generateImage(prompt: string): Promise<string | null> {
  if (!API_KEY) {
    console.error("LEONARDO_API_KEY is missing");
    return null;
  }

  try {
    // 1. Start generation
    console.log(`Starting Leonardo generation for prompt: "${prompt}"`);
    const response = await fetch(`${BASE_URL}/generations`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        height: 768,
        width: 1024,
        modelId: MODEL_ID,
        prompt: prompt,
        num_images: 1,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Leonardo API Error Body: ${errorBody}`);
      throw new Error(
        `Leonardo API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as LeonardoGenerationResponse;
    const generationId = data.sdGenerationJob.generationId;

    // 2. Poll for completion
    let attempts = 0;
    while (attempts < 20) {
      // 20 attempts * 2 seconds = 40 seconds max
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const statusResponse = await fetch(
        `${BASE_URL}/generations/${generationId}`,
        {
          headers: {
            accept: "application/json",
            authorization: `Bearer ${API_KEY}`,
          },
        },
      );

      if (!statusResponse.ok) {
        throw new Error(
          `Leonardo status API error: ${statusResponse.statusText}`,
        );
      }

      const statusData =
        (await statusResponse.json()) as LeonardoGenerationResult;
      const status = statusData.generations_by_pk.status;

      if (status === "COMPLETE") {
        return statusData.generations_by_pk.generated_images[0]?.url || null;
      }

      if (status === "FAILED") {
        throw new Error("Leonardo generation failed");
      }

      attempts++;
    }

    throw new Error("Leonardo generation timed out");
  } catch (err) {
    console.error("Error generating image with Leonardo:", err);
    return null;
  }
}
