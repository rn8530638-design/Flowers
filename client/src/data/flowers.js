// TODO: replace with GET /api/flowers once backend exists.
// Shape is intentionally flat (name, latin, accent, img, desc, fact) so a fetched
// array can be dropped straight into FlowerCarousel's state with no transformation.
//
// `stemEnd` = fraction of the image height (all photos are 1376×1120) at which the
// flower's stem actually ends; below it the photo is just bare green padding. The
// carousel uses it to give the image container an aspect-ratio cropped to just below
// the stem, so each stem ends with a small natural margin instead of floating above a
// large empty gap. (Measured from the source PNGs.)
export const initialFlowersData = [
  {
    name: 'Пион',
    latin: 'Paeonia',
    accent: '#E79BAE',
    // photo's green backdrop sampled at top & bottom — the section background uses this exact
    // vertical gradient so it's indistinguishable from the photo (no seam at the crop edge).
    bgTop: '#BDDCBA', bgBot: '#BAD9B6',
    stemEnd: 0.795,
    img: '/assets/peony-slide.png',
    desc: 'Пышный символ изобилия и нежности. Пион наполняет букет объёмом, лёгкостью и тонким, едва уловимым ароматом.',
    fact: 'В Китае пион считают королём цветов — его изображали на императорских одеждах больше тысячи лет.',
  },
  {
    name: 'Роза',
    latin: 'Rosa',
    accent: '#E0A94F',
    bgTop: '#BFDFC7', bgBot: '#B9D9BF',
    stemEnd: 0.776,
    img: '/assets/rose-slide.png',
    desc: 'Классика, которая никогда не выходит из моды. Тёплый персиковый оттенок дарит ощущение уюта и тепла.',
    fact: 'У розы более 30 000 сортов — от миниатюрных до садовых гигантов высотой в человеческий рост.',
  },
  {
    name: 'Лизиантус',
    latin: 'Eustoma',
    accent: '#A88AC9',
    bgTop: '#C5E0C1', bgBot: '#C1DCBD',
    stemEnd: 0.833,
    img: '/assets/lisianthus-slide.png',
    desc: 'Нежные волнистые лепестки напоминают розу, но выглядят ещё воздушнее и легче. Тонкая лавандовая дымка.',
    fact: 'Лизиантус стоит в вазе до трёх недель, постепенно раскрывая всё новые и новые бутоны.',
  },
  {
    name: 'Незабудка',
    latin: 'Myosotis',
    accent: '#6FA2C4',
    bgTop: '#C7E3C4', bgBot: '#B7D7B4',
    stemEnd: 0.854,
    img: '/assets/forget-me-not-slide.png',
    desc: 'Маленькие голубые цветы — символ памяти, верности и самых тёплых воспоминаний о близких.',
    fact: 'По легенде незабудки выросли там, где влюблённые обещали друг другу никогда не забывать.',
  },
]
