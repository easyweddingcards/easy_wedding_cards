import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Heart, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Toaster } from "../components/ui/sonner";
import { Header } from "../components/landing/Header";
import { Footer } from "../components/landing/Footer";
import { ProductTile } from "../components/shop/ProductTile";
import {
  cards,
  categoryCounts,
  useFavorites,
  slugify,
  PAGE_SIZE,
} from "../lib/shop";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get("category") || "All";
  const categoryRailRef = useRef(null);

  const counts = useMemo(() => categoryCounts(), []);
  const categories = useMemo(() => ["All", ...Object.keys(counts).filter((k) => k !== "All")], [counts]);
  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "price-asc", label: "Low to High" },
    { value: "price-desc", label: "High to Low" },
  ];

  const { favorites, toggle } = useFavorites();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(urlCategory);
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    setCategory(urlCategory);
    setVisible(PAGE_SIZE);
  }, [urlCategory]);

  useEffect(() => {
    const active = categoryRailRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [category]);

  const pickCategory = (c) => {
    setVisible(PAGE_SIZE);
    setSearchParams(c === "All" ? {} : { category: c }, { replace: true });
  };

  const scrollCategories = (direction) => {
    categoryRailRef.current?.scrollBy({
      left: direction * Math.min(420, window.innerWidth * 0.72),
      behavior: "smooth",
    });
  };

  const handleCategoryKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollCategories(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollCategories(1);
    }
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let r = cards;
    if (category !== "All") r = r.filter((c) => c.category === category);
    if (q)
      r = r.filter((c) =>
        [c.id, c.description, c.category, c.size, c.material, ...(c.variants?.flatMap((v) => [v.name, v.size, v.material]) ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    if (showFavorites) r = r.filter((c) => favorites.includes(c.id));
    if (sort === "price-asc") r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    else r = [...r].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return r;
  }, [category, query, sort, showFavorites, favorites]);

  const page = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="App bg-ivory min-h-screen" data-testid="shop-page">
      <Header />
      <Toaster />

      <main className="pt-28 md:pt-36">
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          {/* Intro */}
          <nav className="font-sans text-[0.6rem] uppercase tracking-[0.24em] text-taupe">
            <Link to="/" data-testid="breadcrumb-home" className="link-underline hover:text-espresso transition-colors">
              Home
            </Link>
            <span className="mx-2 text-taupe/50">—</span>
            <span className="text-espresso">The Shop</span>
          </nav>

          <div className="mt-8 md:mt-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="font-sans text-[0.66rem] uppercase tracking-[0.34em] text-rose mb-5">Made to order</p>
              <h1 className="font-serif text-espresso leading-[0.94] tracking-tight text-5xl sm:text-6xl lg:text-7xl">
                Choose the one <span className="italic">you'll</span> send.
              </h1>
            </div>
            <p className="font-sans font-light text-sm md:text-base text-taupe max-w-sm leading-relaxed lg:text-right">
              Each invitation is handcrafted to order — the paper, pressing, foil and ribbon chosen entirely by you.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-ivory/90 backdrop-blur-md border-b border-espresso/10">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-5 py-4 sm:px-8 lg:px-12">
            <div className="grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              {/* Category rail */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollCategories(-1)}
                    aria-label="Scroll categories left"
                    className="hidden h-9 w-9 shrink-0 items-center justify-center border border-espresso/20 bg-cream/30 text-espresso transition-colors duration-300 hover:border-espresso hover:bg-cream md:flex"
                  >
                    <ChevronLeft size={15} strokeWidth={1.5} />
                  </button>

                  <div className="relative min-w-0 flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-ivory to-transparent" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-ivory to-transparent" />
                    <div
                      ref={categoryRailRef}
                      tabIndex={0}
                      onKeyDown={handleCategoryKeyDown}
                      aria-label="Card categories"
                      className="no-scrollbar flex scroll-px-4 gap-2 overflow-x-auto px-1 py-1 scroll-smooth outline-none focus-visible:ring-1 focus-visible:ring-espresso/35"
                    >
                      {categories.map((c) => {
                        const on = category === c;
                        return (
                          <button
                            key={c}
                            onClick={() => pickCategory(c)}
                            data-active={on ? "true" : "false"}
                            data-testid={`category-${slugify(c)}`}
                            className={`shrink-0 border px-4 py-2 font-sans text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                              on ? "border-espresso bg-espresso text-cream" : "border-espresso/20 text-espresso hover:border-espresso hover:bg-cream"
                            }`}
                          >
                            {c === "All" ? "All" : c}
                            <span className={`ml-1.5 ${on ? "text-cream/60" : "text-taupe/70"}`}>{counts[c]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollCategories(1)}
                    aria-label="Scroll categories right"
                    className="hidden h-9 w-9 shrink-0 items-center justify-center border border-espresso/20 bg-cream/30 text-espresso transition-colors duration-300 hover:border-espresso hover:bg-cream md:flex"
                  >
                    <ChevronRight size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Search + saved */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 lg:justify-end">
                <div className="flex min-w-[9.5rem] items-center gap-2 border-b border-espresso/25 pb-1.5">
                  <Search size={14} strokeWidth={1.5} className="text-taupe" />
                  <input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisible(PAGE_SIZE);
                    }}
                    placeholder="Search"
                    aria-label="Search cards"
                    data-testid="shop-search-input"
                    className="w-24 bg-transparent font-sans text-xs text-espresso outline-none placeholder:text-taupe/60 md:w-36"
                  />
                </div>

                <button
                  onClick={() => {
                    setShowFavorites((v) => !v);
                    setVisible(PAGE_SIZE);
                  }}
                  data-testid="favorites-toggle"
                  className={`flex items-center gap-1.5 font-sans text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                    showFavorites ? "text-rose" : "text-espresso hover:text-rose"
                  }`}
                >
                  <Heart size={13} strokeWidth={1.5} className={showFavorites ? "fill-rose text-rose" : ""} />
                  Saved ({favorites.length})
                </button>
              </div>
            </div>

            <div className="border-t border-espresso/10 pt-3">
              <div
                role="group"
                aria-label="Sort cards"
                data-testid="sort-button-group"
                className="inline-flex w-full max-w-full items-center gap-1 overflow-x-auto bg-cream/35 p-1 md:w-auto"
              >
                {sortOptions.map((option) => {
                  const selected = sort === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      data-testid={`sort-${option.value}`}
                      onClick={() => {
                        setSort(option.value);
                        setVisible(PAGE_SIZE);
                      }}
                      className={`min-h-9 flex-1 whitespace-nowrap border px-3 py-2 text-center font-sans text-[0.58rem] uppercase tracking-[0.14em] transition-colors duration-300 md:flex-none ${
                        selected
                          ? "border-espresso bg-espresso text-cream"
                          : "border-transparent text-espresso hover:border-espresso/20 hover:bg-ivory"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12 pt-10">
          <p className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-taupe mb-8" data-testid="results-count">
            {filtered.length} {filtered.length === 1 ? "invitation" : "invitations"}
          </p>

          {page.length === 0 ? (
            <div className="py-24 text-center" data-testid="empty-state">
              <p className="font-serif italic text-3xl text-taupe">Nothing here yet.</p>
              <p className="mt-3 font-sans text-sm text-taupe">Try another category or clear your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-y-24">
              {page.map((c) => (
                <ProductTile key={c.id} c={c} isFavorite={favorites.includes(c.id)} onToggleFavorite={toggle} />
              ))}
            </div>
          )}

          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                data-testid="load-more-btn"
                className="group inline-flex items-center gap-3 font-serif text-2xl md:text-3xl text-espresso"
              >
                <span className="border-b border-espresso/30 pb-1 group-hover:border-espresso transition-colors">
                  Show {Math.min(PAGE_SIZE, filtered.length - visible)} more
                </span>
                <Plus size={18} strokeWidth={1.5} className="text-rose" />
              </button>
            </div>
          )}
        </div>
      </main>

      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
}
