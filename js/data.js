// ── js/data.js ──
// Biographies des auteurs.

var AUTHOR_BIOS = {
  "Albert Einstein": {
    bio: "Physicien théoricien allemand naturalisé américain, Einstein est l'un des plus grands scientifiques de tous les temps. Lauréat du prix Nobel de physique en 1921, il est surtout connu pour sa théorie de la relativité et la formule E=mc². Il était aussi connu pour sa curiosité infinie et sa philosophie de vie humaniste.",
    years: "1879–1955",
  },
  "Mahatma Gandhi": {
    bio: "Leader politique et spirituel indien, Gandhi a guidé l'Inde vers l'indépendance grâce à la résistance non-violente. Sa philosophie de la désobéissance civile a inspiré des mouvements pour les droits civiques à travers le monde entier.",
    years: "1869–1948",
  },
  "Mark Twain": {
    bio: "Samuel Langhorne Clemens, dit Mark Twain, est l'un des plus grands écrivains américains. Auteur de Tom Sawyer et Huckleberry Finn, il est célèbre pour son humour mordant et sa critique sociale déguisée en aventures.",
    years: "1835–1910",
  },
  "Antoine de Saint-Exupéry": {
    bio: "Aviateur et écrivain français, Saint-Exupéry est l'auteur du Petit Prince, l'une des œuvres les plus traduites et lues au monde. Ses écrits mêlent poésie, aventure et méditation sur la condition humaine.",
    years: "1900–1944",
  },
  "Confucius": {
    bio: "Philosophe et enseignant chinois, Confucius est le fondateur du confucianisme. Ses enseignements sur la morale, la famille, la justice et la gouvernance ont profondément influencé les civilisations de l'Asie de l'Est pendant plus de 2 500 ans.",
    years: "551–479 av. J.-C.",
  },
  "Henry Ford": {
    bio: "Industriel américain, fondateur de la Ford Motor Company. Il révolutionna l'industrie automobile en popularisant la chaîne de montage. Sa vision de rendre l'automobile accessible à tous transforma la société du XXe siècle.",
    years: "1863–1947",
  },
  "Sénèque": {
    bio: "Philosophe, dramaturge et homme d'État romain de l'époque impériale. Figure majeure du stoïcisme, ses lettres et essais sur la sagesse, le temps et la mort restent d'une modernité saisissante.",
    years: "4 av. J.-C.–65 ap. J.-C.",
  },
  "Steve Jobs": {
    bio: "Co-fondateur d'Apple, Jobs a révolutionné plusieurs industries : l'informatique personnelle, la musique numérique, le cinéma d'animation et la téléphonie mobile. Visionnaire obsessionnel, il croyait à l'intersection de la technologie et des arts.",
    years: "1955–2011",
  },
  "Nelson Mandela": {
    bio: "Leader anti-apartheid sud-africain, premier président noir de l'Afrique du Sud. Après 27 ans d'emprisonnement, il choisit la réconciliation plutôt que la revanche, devenant un symbole mondial de paix et de justice.",
    years: "1918–2013",
  },
  "Dalaï Lama": {
    bio: "Chef spirituel du bouddhisme tibétain, le 14e Dalaï Lama, Tenzin Gyatso, est lauréat du prix Nobel de la paix en 1989. Ses enseignements sur la compassion, la bienveillance et la paix intérieure touchent des millions de personnes.",
    years: "né en 1935",
  },
  "Eleanor Roosevelt": {
    bio: "Première dame des États-Unis (1933–1945), diplomate et activiste. Elle fut déléguée aux Nations Unies et présida la commission qui rédigea la Déclaration universelle des droits de l'homme.",
    years: "1884–1962",
  },
  "Friedrich Nietzsche": {
    bio: "Philosophe, philologue et poète allemand. Ses œuvres majeures — Ainsi parlait Zarathoustra, Par-delà bien et mal — remettent en question les fondements de la morale et de la religion occidentales.",
    years: "1844–1900",
  },
  "Pablo Picasso": {
    bio: "Peintre, sculpteur et poète espagnol, co-fondateur du cubisme avec Georges Braque. L'une des figures artistiques les plus influentes du XXe siècle, il a produit plus de 20 000 œuvres au cours de sa vie.",
    years: "1881–1973",
  },
  "Lao Tseu": {
    bio: "Philosophe et écrivain chinois, fondateur légendaire du taoïsme. Son œuvre principale, le Tao Te Ching, est l'un des textes les plus traduits au monde et explore l'harmonie, la simplicité et le non-agir.",
    years: "VIe siècle av. J.-C.",
  },
  "Oscar Wilde": {
    bio: "Poète, romancier et dramaturge irlandais, figure flamboyante de l'esthétisme victorien. Auteur du Portrait de Dorian Gray, célèbre pour son esprit acéré et ses aphorismes brillants.",
    years: "1854–1900",
  },
  "Bouddha": {
    bio: "Siddhartha Gautama, le « Bouddha » (l'Éveillé), est le fondateur du bouddhisme. Né dans une famille noble, il abandonna tout pour chercher la vérité, et ses enseignements sur la souffrance et la libération ont transformé des civilisations entières.",
    years: "Ve siècle av. J.-C.",
  },
  "Aristote": {
    bio: "Philosophe grec de l'Antiquité, élève de Platon et précepteur d'Alexandre le Grand. Il a posé les fondements de nombreuses disciplines — logique, biologie, éthique, politique, poétique — et son influence s'étend jusqu'à nos jours.",
    years: "384–322 av. J.-C.",
  },
  "Winston Churchill": {
    bio: "Homme d'État britannique, Premier ministre pendant la Seconde Guerre mondiale. Son leadership inébranlable face au nazisme et ses discours inspirants ont façonné l'histoire du XXe siècle. Lauréat du prix Nobel de littérature en 1953.",
    years: "1874–1965",
  },
  "Paulo Coelho": {
    bio: "Romancier brésilien mondialement connu, auteur de L'Alchimiste, l'un des livres les plus vendus de l'histoire. Son œuvre explore la spiritualité, le destin personnel et la quête de sens.",
    years: "né en 1947",
  },
  "John Lennon": {
    bio: "Musicien, auteur-compositeur et activiste britannique, co-fondateur des Beatles. Après la séparation du groupe, il poursuit une carrière solo et s'engage pour la paix mondiale, jusqu'à son assassinat en 1980.",
    years: "1940–1980",
  },
  "Victor Hugo": {
    bio: "Romancier, poète et dramaturge français, figure de proue du romantisme. Auteur des Misérables et de Notre-Dame de Paris, il fut aussi un homme politique engagé contre la peine de mort et pour les droits des pauvres.",
    years: "1802–1885",
  },
  "Martin Luther King Jr.": {
    bio: "Pasteur baptiste américain et militant des droits civiques. Symbole de la lutte non-violente contre la ségrégation raciale aux États-Unis, son discours « I Have a Dream » reste l'un des plus célèbres de l'histoire. Assassiné en 1968.",
    years: "1929–1968",
  },
  "Socrate": {
    bio: "Philosophe athénien considéré comme l'un des fondateurs de la philosophie occidentale. Il n'a laissé aucun écrit, mais ses idées nous sont parvenues à travers Platon. Il fut condamné à mort pour impiété et a choisi d'accepter la sentence.",
    years: "470–399 av. J.-C.",
  },
  "William Shakespeare": {
    bio: "Dramaturge et poète anglais, Shakespeare est considéré comme le plus grand écrivain de la langue anglaise. Ses 37 pièces de théâtre et 154 sonnets continuent d'être joués et lus dans le monde entier.",
    years: "1564–1616",
  },
  "Thomas Edison": {
    bio: "Inventeur et homme d'affaires américain, surnommé le « Magicien de Menlo Park ». Avec plus de 1 000 brevets à son actif — dont la lampe à incandescence, le phonographe et le cinématographe —, il a transformé la vie quotidienne moderne.",
    years: "1847–1931",
  },
  "Maya Angelou": {
    bio: "Poète, mémorialiste et militante américaine. Son autobiographie Je sais pourquoi chante l'oiseau en cage est une œuvre majeure de la littérature afro-américaine. Elle a reçu de nombreux prix et a lu un poème lors de l'inauguration de Bill Clinton.",
    years: "1928–2014",
  },
  "Galilée": {
    bio: "Astronome, physicien et mathématicien italien, Galilée est l'un des pères de la science moderne. Ses observations au télescope confirmèrent le modèle héliocentrique de Copernic, ce qui lui valut un procès pour hérésie devant l'Inquisition.",
    years: "1564–1642",
  },
  "Jacques Prévert": {
    bio: "Poète et scénariste français, figure emblématique de la culture populaire du XXe siècle. Son recueil Paroles (1946) est l'un des livres de poésie les plus lus en France. Il est aussi connu pour ses scénarios de films comme Les Enfants du paradis.",
    years: "1900–1977",
  },
  "Ambrose Redmoon": {
    bio: "Écrivain et figure contre-culturelle américain, de son vrai nom James Neil Hollingworth. Peu connu du grand public, il est surtout célèbre pour cette seule citation sur le courage, publiée dans le magazine Gnosis en 1991.",
    years: "1933–1996",
  },
  "Dante Alighieri": {
    bio: "Poète florentin du Moyen Âge, auteur de La Divine Comédie, chef-d'œuvre de la littérature mondiale qui décrit un voyage allégorique à travers l'Enfer, le Purgatoire et le Paradis. Il est considéré comme le père de la langue italienne.",
    years: "1265–1321",
  },
  "Thich Nhat Hanh": {
    bio: "Moine bouddhiste zen vietnamien, poète et militant pour la paix. Exilé de son pays pendant 40 ans en raison de ses positions pacifistes durant la guerre du Vietnam, il a popularisé la pleine conscience (mindfulness) en Occident.",
    years: "1926–2022",
  },
  "Eric Hoffer": {
    bio: "Philosophe social et écrivain américain autodidacte. Longtemps docker sur les quais de San Francisco, il publia La Cohue des gueux, une analyse pénétrante des mouvements de masse et du fanatisme, qui lui vaut la Médaille présidentielle de la Liberté.",
    years: "1902–1983",
  },
  "Franklin D. Roosevelt": {
    bio: "32e président des États-Unis, il guida son pays à travers deux crises majeures : la Grande Dépression avec le New Deal et la Seconde Guerre mondiale. Atteint de poliomyélite, il gouverna malgré son handicap et reste l'un des présidents les plus influents de l'histoire américaine.",
    years: "1882–1945",
  },
  "William James": {
    bio: "Philosophe et psychologue américain, fondateur du pragmatisme et de la psychologie fonctionnelle aux États-Unis. Son œuvre Les Principes de psychologie (1890) a posé les bases de la psychologie moderne.",
    years: "1842–1910",
  },
  "C. S. Lewis": {
    bio: "Écrivain et théologien britannique, professeur à Oxford et Cambridge. Auteur des Chroniques de Narnia et des Lettres de l'Oncle Screwtape, il est l'une des figures majeures de la littérature fantastique chrétienne du XXe siècle.",
    years: "1898–1963",
  },
  "Mère Teresa": {
    bio: "Religieuse catholique albanaise-indienne fondatrice des Missionnaires de la Charité à Calcutta. Consacrant sa vie aux plus pauvres parmi les pauvres, elle reçut le prix Nobel de la paix en 1979. Canonisée par le pape François en 2016.",
    years: "1910–1997",
  },
  "Edmund Hillary": {
    bio: "Alpiniste et explorateur néo-zélandais, premier homme à avoir atteint le sommet de l'Everest avec le sherpa Tenzing Norgay, le 29 mai 1953. Il consacra ensuite sa vie à aider les populations sherpa du Népal.",
    years: "1919–2008",
  },
  "Anatole France": {
    bio: "Romancier, journaliste et poète français, lauréat du prix Nobel de littérature en 1921. Connu pour son style élégant et son ironie mordante, il s'engagea activement dans l'affaire Dreyfus aux côtés de Zola.",
    years: "1844–1924",
  },
  "Frank Sinatra": {
    bio: "Chanteur et acteur américain, surnommé « The Voice » et « Ol' Blue Eyes ». Figure emblématique de la musique populaire du XXe siècle, il a vendu plus de 150 millions de disques et reçu un Oscar pour sa performance dans Tant qu'il y aura des hommes.",
    years: "1915–1998",
  },
  "Rutherford B. Hayes": {
    bio: "19e président des États-Unis (1877–1881). Son élection controversée mit fin à la Reconstruction après la guerre de Sécession. Bien que peu cité pour cette phrase dans les sources historiques, son nom y est traditionnellement associé.",
    years: "1822–1893",
  },
  "Henry David Thoreau": {
    bio: "Écrivain, philosophe et naturaliste américain. Son essai La Désobéissance civile et son ouvrage Walden, récit de sa vie en pleine nature, ont profondément influencé la pensée écologiste et les mouvements de résistance non-violente de Gandhi à Martin Luther King.",
    years: "1817–1862",
  },
  "Charlie Chaplin": {
    bio: "Acteur, réalisateur et compositeur britannique, génie du cinéma muet. Son personnage de Charlot, petit vagabond plein de poésie, le rendit célèbre dans le monde entier. Son film Le Dictateur (1940) est une satire courageuse du nazisme.",
    years: "1889–1977",
  },
  "Wayne Gretzky": {
    bio: "Hockeyeur canadien surnommé « The Great One », considéré comme le meilleur joueur de hockey sur glace de tous les temps. Il détient encore aujourd'hui la plupart des records de la LNH, dont celui des points en carrière.",
    years: "né en 1961",
  },
  "Oliver Wendell Holmes": {
    bio: "Juriste américain, juge à la Cour suprême pendant 30 ans. Surnommé « The Great Dissenter » pour ses opinions dissidentes influentes, il fut l'un des fondateurs du mouvement juridique du réalisme et défenseur de la liberté d'expression.",
    years: "1841–1935",
  },
  "Emiliano Zapata": {
    bio: "Révolutionnaire mexicain et figure centrale de la Révolution mexicaine (1910–1920). Chef du mouvement paysan, il se battit pour la réforme agraire et la restitution des terres aux communautés indigènes. Il reste un symbole de la lutte pour la justice sociale en Amérique latine.",
    years: "1879–1919",
  },
  "Malcolm Cowley": {
    bio: "Critique littéraire, éditeur et écrivain américain. Il est surtout connu pour avoir contribué à la reconnaissance de la Génération Perdue (Hemingway, Fitzgerald) et pour son œuvre autobiographique Exil's Return sur les expatriés américains à Paris dans les années 1920.",
    years: "1898–1989",
  },
  "George Bernard Shaw": {
    bio: "Dramaturge, critique et polémiste irlandais, l'une des figures majeures du théâtre occidental. Lauréat du prix Nobel de littérature en 1925, il est connu pour ses pièces à la fois brillantes et engagées, dont Pygmalion, adaptée plus tard en comédie musicale (My Fair Lady).",
    years: "1856–1950",
  },
  "Saint Augustin": {
    bio: "Théologien et philosophe de l'Antiquité tardive, évêque d'Hippone (aujourd'hui Annaba, Algérie). Ses Confessions et La Cité de Dieu comptent parmi les œuvres les plus influentes de la pensée occidentale, posant les bases de la théologie chrétienne médiévale.",
    years: "354–430",
  },
  "Jimi Hendrix": {
    bio: "Guitariste, chanteur et compositeur américain, considéré comme l'un des plus grands guitaristes de l'histoire du rock. En seulement quatre ans de carrière, il a révolutionné la façon de jouer de la guitare électrique et laissé une empreinte indélébile sur la musique populaire.",
    years: "1942–1970",
  },
  "Maëlle": {
    bio: "Maëlle est une jeune femme dont les mots traduisent avec sincérité ce que le cœur ressent. Ses citations, empreintes de tendresse et d'authenticité, rappellent que les plus belles pensées naissent souvent des émotions les plus simples.",
    years: "2007 — aujourd'hui",
  },
};
