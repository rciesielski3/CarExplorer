Poniżej gotowy plan/prompt dla Codex:

Download: ⁠￼ExploreScreen.tsx⁠￼

Cel:
Poprawić ładowanie zdjęć aut:

1. Primary: Wikipedia REST API.
2. Secondary: CarImages API.
3. Final fallback: initials / tekst zamiast ikony "NO CAR".
   Kontekst:
   Obecnie `ExploreScreen.tsx` renderuje `CarCard` z:

- make
- model
- year: modelYear
- vehicleType
  Nie zmieniaj logiki pobierania modeli z NHTSA. Zmiany dotyczą tylko obrazków aut i fallbacków.
  Ważne fakty:
- Wikipedia REST endpoint: `/api/rest_v1/page/summary/{title}`.
- CarImages API Free ma 5,000 requestów/miesiąc, watermark i WebP-only; REST API jest dostępne dopiero w płatnych planach.
- Free plan powinien używać JS loadera albo signed image URLs, a nie katalogowego REST API.
- CarImages obsługuje fuzzy matching dla make/model, więc nie trzeba idealnego dopasowania.
  Źródło: https://carimagesapi.com/docs
  Implementacja:

1. Utwórz/zmień plik:
   `src/api/wikipediaApi.ts`
   Dodaj funkcję:

```ts
export async function fetchWikipediaCarImage(
  make: string,
  model: string
): Promise<string | null> {
  const candidates = buildWikipediaCandidates(make, model);
  for (const title of candidates) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const response = await fetch(url);
      if (!response.ok) continue;
      const data = await response.json();
      const imageUrl =
        data?.thumbnail?.source ||
        data?.originalimage?.source ||
        null;
      if (imageUrl) return imageUrl;
    } catch {
      continue;
    }
  }
  return null;
}
function buildWikipediaCandidates(make: string, model: string): string[] {
  const fullName = `${make} ${model}`.trim();
  return [
    `${fullName}`,
    `${fullName} automobile`,
    `${fullName} car`,
    `${make} ${model.replace(make, "").trim()} automobile`,
  ].filter(Boolean);
}

2. Dodaj fallback CarImages:
    src/api/carImagesApi.ts

Dla darmowego planu NIE używać płatnych katalogowych endpointów REST.
Najprościej przygotować URL dla obrazka:

export function getCarImagesFallbackUrl(params: {
  make: string;
  model?: string;
  year?: string | null;
}) {
  const query = new URLSearchParams({
    type: "car",
    make: params.make,
    width: "800",
    format: "webp",
  });
  if (params.model) query.set("model", params.model);
  if (params.year) query.set("year", params.year);
  return `https://carimagesapi.com/image?${query.toString()}`;
}

Uwaga:
Jeśli obraz wymaga podpisu/signed URL/API key, nie trzymać sekretów w FE. Dodać później backend endpoint np. /api/car-image-url, który generuje signed URL server-side.

3. Zmień CarCard.tsx

Dodaj prostą kolejność:

* próbuj Wikipedia image,
* jeśli brak albo onError, próbuj CarImages fallback,
* jeśli też błąd, pokaż initials.

Przykładowa logika:

const [imageUri, setImageUri] = useState<string | null>(null);
const [sourceStep, setSourceStep] = useState<"wiki" | "carimages" | "fallback">("wiki");
useEffect(() => {
  let mounted = true;
  async function loadImage() {
    const wikiImage = await fetchWikipediaCarImage(make, model);
    if (!mounted) return;
    if (wikiImage) {
      setImageUri(wikiImage);
      setSourceStep("wiki");
      return;
    }
    setImageUri(getCarImagesFallbackUrl({ make, model, year }));
    setSourceStep("carimages");
  }
  loadImage();
  return () => {
    mounted = false;
  };
}, [make, model, year]);

onError:

const handleImageError = () => {
  if (sourceStep === "wiki") {
    setImageUri(getCarImagesFallbackUrl({ make, model, year }));
    setSourceStep("carimages");
    return;
  }
  setImageUri(null);
  setSourceStep("fallback");
};

Fallback UI:

{imageUri ? (
  <Image source={{ uri: imageUri }} onError={handleImageError} />
) : (
  <View style={styles.imageFallback}>
    <Text>{make.slice(0, 2).toUpperCase()}</Text>
    <Text numberOfLines={1}>{model}</Text>
  </View>
)}

4. Dodaj cache, żeby nie spamować API

Minimalnie:

* prosty in-memory cache w wikipediaApi.ts

const imageCache = new Map<string, string | null>();

Klucz:

const cacheKey = `${make}:${model}`.toLowerCase();

5. Nie zmieniaj ExploreScreen.tsx, poza ewentualnym przekazaniem year, jeśli CarCard jeszcze go nie przyjmuje.

Obecnie ExploreScreen.tsx już przekazuje:

make={selectedMake!}
model={item.name}
compareCar={{
  make: selectedMake!,
  model: item.name,
  year: modelYear,
  vehicleType,
}}

Jeśli CarCard nie ma propsa year, dodaj:

year={modelYear}

6. Acceptance Criteria

* Brak tekstu/ikony “NO CAR”.
* Dla popularnych modeli pojawia się obraz z Wikipedii.
* Gdy Wikipedia nie znajdzie zdjęcia, aplikacja próbuje CarImages.
* Gdy oba źródła zawiodą, karta pokazuje estetyczny fallback z initials + nazwą modelu.
* Brak sekretów/API secretów w aplikacji mobilnej.
* Logika obrazków jest zamknięta w CarCard + małych helperach API.

Kluczowa uwaga: CarImages Free nie daje pełnego REST API — darmowo ma 5,000 requestów/miesiąc, watermark i WebP-only, a REST catalog endpoints są oznaczone jako paid/server-side.  [oai_citation:0‡carimagesapi.com](https://carimagesapi.com/docs)
```
