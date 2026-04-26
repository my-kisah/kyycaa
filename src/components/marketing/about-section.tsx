import { SectionHeading } from "@/components/ui/section-heading";
import { SiteShell } from "@/components/layout/site-shell";

const values = [
  {
    title: "Tema indah dan berkelas",
    description:
      "Website ini dirancang dengan konsep romantis modern yang indah, lembut, elegan, dan profesional agar setiap kenangan terasa istimewa saat dibuka kembali.",
  },
  {
    title: "Full private dan aman",
    description:
      "Seluruh akses dibuat full private. Pengguna yang belum login tidak dapat melihat isi di dalamnya, dan setiap hak akses dijaga ketat agar privasi tetap terlindungi.",
  },
  {
    title: "Full enkripsi dan terlindungi",
    description:
      "Sistem dibangun dengan perlindungan keamanan berlapis, enkripsi pada bagian penting, dan struktur yang aman agar data, akun, serta kenangan tetap terjaga dengan maksimal.",
  },
];

export function AboutSection() {
  return (
    <section id="tentang" className="py-20">
      <SiteShell className="space-y-10">
        <SectionHeading
          eyebrow="Tentang Website"
          title="Ruang kenangan romantis yang hanya terbuka untuk pengguna terdaftar."
          description="Dirancang untuk menyimpan momen spesial dalam suasana yang lembut, privat, dan profesional. Semua isi konten hanya bisa diakses setelah login."
        />
        <div suppressHydrationWarning className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              suppressHydrationWarning
              className="rounded-[30px] border border-white/55 bg-white/65 p-7 shadow-[0_24px_60px_rgba(206,140,170,0.12)] backdrop-blur-xl"
            >
              <h3 className="font-display text-3xl text-rose-950">{value.title}</h3>
              <p className="mt-4 text-sm leading-8 text-rose-800/78">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </SiteShell>
    </section>
  );
}
