import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";
import type { ImageType } from "@prisma/client";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Anda harus login untuk melakukan ini" },
        { status: 401 }
      );
    }

    // 2. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tradeId = formData.get("tradeId") as string | null;
    const imageType = formData.get("imageType") as string | null;

    // 3. Validate inputs
    if (!file || !tradeId || !imageType) {
      return NextResponse.json(
        { error: "Field file, tradeId, dan imageType wajib diisi" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan JPG, PNG, atau WEBP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File terlalu besar (maksimal 10MB)" },
        { status: 400 }
      );
    }

    if (!["before", "after"].includes(imageType.toLowerCase())) {
      return NextResponse.json(
        { error: "imageType harus 'before' atau 'after'" },
        { status: 400 }
      );
    }

    // 4. Verify trade ownership
    const trade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        backtestSession: { userId: user.id },
      },
    });

    if (!trade) {
      return NextResponse.json(
        { error: "Anda tidak memiliki akses ke data ini" },
        { status: 403 }
      );
    }

    // 5. Upload to Supabase Storage
    // Path convention: journal-images/{userId}/{tradeId}/{imageType}.{ext}
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${user.id}/${tradeId}/${imageType.toLowerCase()}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("journal-images")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Gagal mengupload file. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // 6. Generate signed URL (1 year validity)
    const { data: urlData, error: urlError } = await supabase.storage
      .from("journal-images")
      .createSignedUrl(storagePath, 60 * 60 * 24 * 365);

    if (urlError || !urlData?.signedUrl) {
      return NextResponse.json(
        { error: "Gagal membuat URL file. Silakan coba lagi." },
        { status: 500 }
      );
    }

    // 7. Upsert TradeImage record in DB
    const normalizedImageType = imageType.toUpperCase() as ImageType;

    await prisma.tradeImage.upsert({
      where: {
        tradeId_imageType: {
          tradeId,
          imageType: normalizedImageType,
        },
      },
      create: {
        tradeId,
        imageType: normalizedImageType,
        storageUrl: urlData.signedUrl,
      },
      update: {
        storageUrl: urlData.signedUrl,
      },
    });

    return NextResponse.json({ url: urlData.signedUrl });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
