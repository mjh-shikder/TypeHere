// =============================================================================
// TypeHere — Word Banks & Word Stream Generator
// =============================================================================

/**
 * Top 1000 most common English words
 * Curated for typing practice — excludes single letters, abbreviations, and
 * words with unusual characters.
 */
export const WORD_BANK_1000: string[] = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'great', 'between', 'need', 'large', 'under', 'never', 'each', 'much', 'begin',
  'life', 'high', 'right', 'still', 'every', 'last', 'long', 'where', 'same',
  'another', 'place', 'while', 'home', 'read', 'hand', 'port', 'found', 'stand',
  'own', 'page', 'should', 'country', 'again', 'school', 'might', 'world', 'near',
  'build', 'self', 'earth', 'father', 'head', 'three', 'story', 'saw', 'far',
  'number', 'change', 'went', 'light', 'point', 'mother', 'answer', 'old',
  'different', 'move', 'kind', 'off', 'house', 'picture', 'try', 'study',
  'night', 'live', 'door', 'turn', 'real', 'leave', 'game', 'power',
  'bring', 'word', 'letter', 'start', 'always', 'next', 'body', 'learn',
  'carry', 'name', 'been', 'often', 'form', 'air', 'line', 'set',
  'water', 'run', 'small', 'end', 'put', 'land', 'here', 'must', 'big',
  'help', 'through', 'around', 'important', 'keep', 'children', 'food', 'side',
  'feet', 'car', 'mile', 'walk', 'white', 'sea', 'hard', 'once',
  'open', 'together', 'show', 'idea', 'enough', 'eat', 'face', 'watch',
  'four', 'state', 'close', 'eye', 'plant', 'city', 'tree', 'cross',
  'farm', 'story', 'river', 'cut', 'press', 'young', 'girl', 'sometimes',
  'miss', 'room', 'grow', 'book', 'paper', 'draw', 'group', 'music',
  'those', 'both', 'mark', 'hear', 'fast', 'full', 'king', 'today',
  'reach', 'ship', 'top', 'whole', 'class', 'sure', 'fire', 'south',
  'problem', 'piece', 'told', 'knew', 'pass', 'since', 'stop', 'best',
  'hour', 'better', 'true', 'during', 'hundred', 'five', 'remember', 'step',
  'early', 'hold', 'west', 'ground', 'interest', 'voice', 'table', 'travel',
  'less', 'morning', 'simple', 'several', 'vowel', 'toward', 'war', 'lay',
  'against', 'pattern', 'slow', 'center', 'love', 'person', 'money', 'serve',
  'appear', 'road', 'map', 'rain', 'rule', 'govern', 'pull', 'cold',
  'notice', 'fact', 'street', 'inch', 'lot', 'nothing', 'course', 'stay',
  'wheel', 'front', 'teach', 'week', 'final', 'gave', 'green', 'oh',
  'quick', 'develop', 'ocean', 'warm', 'free', 'minute', 'strong', 'special',
  'mind', 'behind', 'clear', 'tail', 'produce', 'cover', 'song', 'field',
  'rest', 'correct', 'able', 'pound', 'done', 'beauty', 'drive', 'stood',
  'contain', 'unit', 'wind', 'area', 'dark', 'machine', 'note', 'wait',
  'plan', 'figure', 'star', 'box', 'noun', 'size', 'class', 'remain',
  'possible', 'sleep', 'wonder', 'laugh', 'thousand', 'ago', 'ran', 'check',
  'shape', 'equation', 'race', 'bit', 'house', 'whose', 'heat', 'method',
  'bright', 'lead', 'listen', 'happen', 'solve', 'metal', 'son', 'either',
  'ice', 'age', 'dry', 'express', 'boat', 'common', 'gold', 'region',
  'energy', 'known', 'space', 'table', 'provide', 'thus', 'capital', 'chair',
  'danger', 'fruit', 'rich', 'thick', 'soldier', 'process', 'operate', 'guess',
  'necessary', 'sharp', 'wing', 'create', 'neighbor', 'wash', 'bat', 'rather',
  'crowd', 'corn', 'compare', 'poem', 'string', 'bell', 'depend', 'meat',
  'rub', 'tube', 'famous', 'dollar', 'stream', 'fear', 'sight', 'thin',
  'triangle', 'planet', 'hurry', 'chief', 'colony', 'clock', 'mine', 'tie',
  'enter', 'major', 'fresh', 'search', 'send', 'yellow', 'gun', 'allow',
  'print', 'dead', 'spot', 'desert', 'suit', 'current', 'lift', 'rose',
  'arrive', 'master', 'track', 'parent', 'shore', 'division', 'sheet', 'substance',
  'favor', 'connect', 'post', 'spend', 'chord', 'fat', 'glad', 'original',
  'share', 'station', 'dad', 'bread', 'charge', 'proper', 'bar', 'offer',
  'segment', 'slave', 'duck', 'instant', 'market', 'degree', 'populate', 'chick',
  'dear', 'enemy', 'reply', 'drink', 'occur', 'support', 'speech', 'nature',
  'range', 'steam', 'motion', 'path', 'liquid', 'log', 'meant', 'quotient',
  'teeth', 'shell', 'neck', 'oxygen', 'sugar', 'death', 'pretty', 'skill',
  'women', 'season', 'solution', 'magnet', 'silver', 'thank', 'branch', 'match',
  'suffix', 'especially', 'fig', 'afraid', 'huge', 'sister', 'steel', 'discuss',
  'forward', 'similar', 'guide', 'experience', 'score', 'apple', 'bought', 'type',
  'stretch', 'throw', 'shine', 'property', 'column', 'molecule', 'select', 'wrong',
  'gray', 'repeat', 'require', 'broad', 'prepare', 'salt', 'nose', 'plural',
  'anger', 'claim', 'continent', 'happen', 'element', 'weight', 'finger', 'forest',
  'spring', 'observe', 'child', 'straight', 'consonant', 'nation', 'dictionary',
  'milk', 'speed', 'flower', 'quite', 'broke', 'case', 'middle', 'kill',
  'cause', 'fish', 'mountain', 'busy', 'winter', 'string', 'written', 'wild',
  'instrument', 'kept', 'glass', 'grass', 'cow', 'cloud', 'quiet', 'stone',
  'tiny', 'climb', 'cool', 'design', 'poor', 'lot', 'experiment', 'bottom',
  'key', 'iron', 'single', 'stick', 'flat', 'twenty', 'skin', 'smile',
  'crease', 'hole', 'jump', 'baby', 'eight', 'village', 'meet', 'root',
  'buy', 'raise', 'paint', 'above', 'industry', 'island', 'swim', 'sentence',
  'supply', 'bone', 'rail', 'imagine', 'garden', 'please', 'finger', 'wonder',
  'cotton', 'crop', 'tone', 'join', 'suggest', 'clean', 'break', 'lady',
  'yard', 'rise', 'bad', 'blow', 'oil', 'blood', 'touch', 'grew',
  'cent', 'mix', 'team', 'wire', 'cost', 'lost', 'brown', 'wear',
  'act', 'hat', 'total', 'basic', 'smell', 'valley', 'count', 'brain',
  'value', 'summer', 'wall', 'chart', 'camp', 'wish', 'sky', 'board',
  'joy', 'winter', 'sat', 'month', 'copy', 'doctor', 'please', 'protect',
  'noon', 'whose', 'locate', 'ring', 'character', 'insect', 'caught', 'period',
  'indicate', 'radio', 'spoke', 'atom', 'human', 'history', 'effect', 'electric',
  'expect', 'crop', 'modern', 'element', 'hit', 'student', 'corner', 'party',
  'danger', 'quiet', 'trade', 'visit', 'rather', 'fall', 'level', 'column',
  'surprise', 'window', 'morning', 'depend', 'search', 'tone', 'trouble', 'flow',
  'fair', 'bank', 'collect', 'save', 'control', 'decimal', 'gentle', 'company',
  'catch', 'condition', 'feed', 'decide', 'master', 'coast', 'cell', 'material',
  'special', 'strange', 'excite', 'thick', 'dictionary', 'position', 'major', 'oxygen',
  'practice', 'separate', 'difficult', 'represent', 'electric', 'determine',
  'develop', 'captain', 'thought', 'product', 'direct', 'general', 'brother',
  'success', 'matter', 'nothing', 'continue', 'remember', 'question', 'complete',
  'system', 'behind', 'result', 'already', 'become', 'problem', 'perhaps',
  'order', 'possible', 'include', 'consider', 'program', 'early', 'certain',
  'morning', 'toward', 'build', 'carry', 'notice', 'interest', 'present',
  'finally', 'produce', 'happen', 'picture', 'number', 'account', 'measure',
  'several', 'forward', 'subject', 'second', 'figure', 'provide', 'process',
  'market', 'expect', 'develop', 'support', 'service', 'contain', 'control',
  'protect', 'suggest', 'require', 'prepare', 'discuss', 'industry', 'property',
  'through', 'against', 'between', 'another', 'something', 'together', 'important',
  'children', 'country', 'different', 'answer', 'change', 'follow', 'example',
  'thought', 'feeling', 'hundred', 'thousand', 'million', 'across', 'family',
  'return', 'believe', 'around', 'government', 'always', 'enough', 'before'
];

/**
 * Extended word bank with 5000 words
 * In production, this would be loaded from a separate JSON file.
 * For now, we duplicate and extend the 1000-word bank.
 */
export const WORD_BANK_5000: string[] = [
  ...WORD_BANK_1000,
  // Extended words for advanced typists
  'abandon', 'ability', 'absence', 'absolute', 'absorb', 'abstract', 'absurd', 'abuse',
  'academic', 'academy', 'accelerate', 'accent', 'accept', 'access', 'accident', 'accompany',
  'accomplish', 'according', 'account', 'accurate', 'accuse', 'achieve', 'acknowledge',
  'acquire', 'adaptation', 'adequate', 'adjust', 'administration', 'admire', 'admission',
  'adolescent', 'adopt', 'adult', 'advance', 'adventure', 'advertise', 'advice', 'advocate',
  'aesthetic', 'affair', 'affect', 'afford', 'aggressive', 'agreement', 'agriculture',
  'aircraft', 'alcohol', 'alliance', 'allocate', 'alongside', 'alternative', 'aluminum',
  'amateur', 'ambassador', 'ambition', 'amendment', 'amount', 'analysis', 'ancestor',
  'ancient', 'angle', 'announce', 'annual', 'anticipate', 'anxiety', 'anything',
  'apartment', 'apparent', 'appeal', 'appetite', 'applaud', 'application', 'appoint',
  'appreciate', 'approach', 'approval', 'arbitrary', 'architect', 'argue', 'argument',
  'arrangement', 'arrest', 'arrival', 'article', 'artificial', 'assault', 'assemble',
  'assertion', 'assessment', 'assign', 'assist', 'associate', 'assumption', 'atmosphere',
  'attach', 'attempt', 'attend', 'attitude', 'attract', 'attribute', 'auction', 'audience',
  'authority', 'automatic', 'available', 'average', 'aviation', 'awesome', 'awkward',
  'backdrop', 'balance', 'balloon', 'banana', 'bandwidth', 'bankrupt', 'bargain',
  'barrier', 'basement', 'basket', 'battery', 'battlefield', 'beacon', 'bearing',
  'beautiful', 'bedroom', 'behavior', 'beneath', 'benefit', 'beside', 'between',
  'beyond', 'bicycle', 'billion', 'biology', 'birthday', 'blanket', 'blessing',
  'blind', 'blossom', 'blueprint', 'border', 'bother', 'bottle', 'boundary',
  'bracket', 'branch', 'breathe', 'breeding', 'brilliant', 'broadcast', 'browser',
  'budget', 'buffalo', 'building', 'bulletin', 'burden', 'bureau', 'burning',
  'cabinet', 'calculate', 'calendar', 'campaign', 'campus', 'cancel', 'candidate',
  'capable', 'capacity', 'capture', 'carbon', 'career', 'careful', 'cargo',
  'carpet', 'carrier', 'casual', 'catalog', 'category', 'caution', 'celebrate',
  'ceremony', 'certain', 'certificate', 'chairman', 'challenge', 'champion', 'chapter',
  'charity', 'chemical', 'chicken', 'chocolate', 'chronic', 'circuit', 'citizen',
  'civilian', 'classic', 'classroom', 'climate', 'clinical', 'closet', 'cluster',
  'coalition', 'collapse', 'colleague', 'collection', 'colonial', 'combination',
  'comfort', 'command', 'commence', 'comment', 'commerce', 'commission', 'commitment',
  'committee', 'commodity', 'communicate', 'community', 'companion', 'comparable',
  'comparison', 'compel', 'compensate', 'compete', 'complaint', 'complement',
  'complex', 'compliance', 'complicate', 'component', 'compose', 'comprehensive',
  'compromise', 'compute', 'conceal', 'concentrate', 'concept', 'concern', 'conclude',
  'concrete', 'condemn', 'conduct', 'conference', 'confess', 'confidence', 'confirm',
  'conflict', 'confront', 'confusion', 'congress', 'connect', 'conscience',
  'consensus', 'consent', 'consequence', 'conservation', 'conservative', 'consist',
  'consistent', 'constant', 'constitute', 'construct', 'consultant', 'consume',
  'consumer', 'contact', 'contemporary', 'content', 'contest', 'context', 'contract',
  'contrast', 'contribute', 'controversy', 'convention', 'conversation', 'convert',
  'conviction', 'convince', 'cooperate', 'coordinate', 'corporate', 'correct',
  'correspond', 'corridor', 'costume', 'cotton', 'council', 'counsel', 'counter',
  'countless', 'courage', 'courtesy', 'coverage', 'creation', 'creative', 'creature',
  'criminal', 'crisis', 'criteria', 'critical', 'criticism', 'crucial', 'crystal',
  'cultural', 'curiosity', 'currency', 'current', 'curriculum', 'customer', 'cylinder',
  'darkness', 'database', 'deadline', 'dealing', 'debate', 'decade', 'decline',
  'decorate', 'decrease', 'dedicate', 'default', 'defence', 'deficit', 'define',
  'definite', 'deliberate', 'delicate', 'deliver', 'delivery', 'demand', 'democracy',
  'democrat', 'demonstrate', 'density', 'deposit', 'depress', 'deprive', 'deputy',
  'derive', 'describe', 'description', 'designer', 'desire', 'desktop', 'desperate',
  'despite', 'destroy', 'destruction', 'detail', 'detect', 'detective', 'developer',
  'device', 'devote', 'diabetes', 'dialogue', 'diameter', 'diamond', 'digital',
  'dignity', 'dilemma', 'dimension', 'dinosaur', 'diplomat', 'direction', 'director',
  'disability', 'disagree', 'disappear', 'disaster', 'discipline', 'discount',
  'discover', 'discovery', 'discrete', 'discrimination', 'disorder', 'display',
  'disposal', 'dispute', 'dissolve', 'distance', 'distinct', 'distinction',
  'distinguish', 'distribute', 'district', 'diverse', 'diversity', 'divide',
  'division', 'doctrine', 'document', 'domestic', 'dominant', 'dominate', 'donation',
  'double', 'download', 'downtown', 'dramatic', 'drawing', 'driveway', 'dynamic',
  'earning', 'eastern', 'ecology', 'economic', 'edition', 'editorial', 'educate',
  'education', 'effective', 'efficiency', 'elaborate', 'election', 'elegant',
  'eliminate', 'embrace', 'emerge', 'emergency', 'emission', 'emotion', 'emphasis',
  'employee', 'employer', 'employment', 'empower', 'encounter', 'encourage',
  'endless', 'enforce', 'engage', 'engineer', 'enormous', 'enterprise', 'entertain',
  'enthusiasm', 'entrance', 'envelope', 'environment', 'episode', 'equality',
  'equation', 'equipment', 'equivalent', 'erosion', 'escape', 'essential',
  'establish', 'estimate', 'evaluate', 'evening', 'eventual', 'evidence', 'evolution',
  'examine', 'exception', 'exchange', 'excitement', 'exclusive', 'execute',
  'exercise', 'exhibit', 'exhibition', 'existence', 'expand', 'expansion',
  'expedition', 'expense', 'experiment', 'expertise', 'explain', 'explicit',
  'exploit', 'explore', 'explosion', 'export', 'exposure', 'expression', 'extend',
  'extension', 'extensive', 'external', 'extraordinary', 'extreme', 'eyebrow',
  'fabric', 'facility', 'factory', 'faculty', 'failure', 'faithful', 'familiar',
  'fantasy', 'fashion', 'favorite', 'feature', 'federal', 'feedback', 'festival',
  'fiction', 'fifteen', 'fighter', 'filename', 'filmmaking', 'finance', 'financial',
  'finding', 'fireplace', 'firmware', 'fishing', 'fitness', 'flexible', 'flight',
  'floating', 'flooding', 'folklore', 'football', 'footprint', 'forecast', 'foreign',
  'forgive', 'formula', 'fortune', 'fossil', 'foundation', 'founder', 'fraction',
  'fragment', 'framework', 'franchise', 'freedom', 'frequent', 'friendly', 'frontier',
  'frustrate', 'function', 'fundamental', 'funding', 'funeral', 'furniture', 'gallery',
  'gambling', 'garage', 'garbage', 'gasoline', 'gateway', 'gather', 'gender',
  'generate', 'generation', 'genetic', 'genius', 'genuine', 'gesture', 'global',
  'glimpse', 'gorgeous', 'graduate', 'grateful', 'gravity', 'grocery', 'guarantee',
  'guardian', 'guidance', 'habitat', 'handful', 'handicap', 'handsome', 'happiness',
  'harbor', 'hardware', 'harmony', 'harvest', 'headline', 'healing', 'healthy',
  'hearing', 'heavily', 'height', 'helpful', 'heritage', 'highway', 'himself',
  'historic', 'homework', 'honest', 'horizon', 'horrible', 'hospital', 'hostile',
  'household', 'housing', 'humanity', 'humble', 'humidity', 'hunting', 'hurricane',
  'hydrogen', 'identical', 'identify', 'identity', 'ideology', 'ignorance', 'illegal',
  'illusion', 'illustrate', 'imagine', 'immediate', 'immigrant', 'immune', 'impact',
  'imperial', 'implement', 'implication', 'implicit', 'impress', 'impression',
  'improve', 'incentive', 'incident', 'include', 'income', 'incorporate', 'increase',
  'incredible', 'independence', 'independent', 'indicate', 'individual', 'indoor',
  'industrial', 'inevitable', 'infantry', 'infection', 'infinite', 'inflation',
  'influence', 'informal', 'infrastructure', 'ingredient', 'inhabit', 'initial',
  'initiative', 'innocent', 'innovation', 'inquiry', 'insight', 'inspect',
  'inspiration', 'install', 'instance', 'institute', 'institution', 'instruct',
  'insurance', 'integrate', 'integrity', 'intellectual', 'intelligence', 'intend',
  'intense', 'interact', 'interior', 'internal', 'interpret', 'interval', 'intimate',
  'introduce', 'invasion', 'invention', 'invest', 'investigate', 'invisible',
  'invitation', 'involve', 'isolation', 'journal', 'journey', 'judgment', 'junction',
  'junior', 'justice', 'justify', 'keyboard', 'kingdom', 'kitchen', 'knowledge',
  'landscape', 'language', 'laptop', 'largely', 'lateral', 'latitude', 'latter',
  'launch', 'lawsuit', 'leadership', 'learning', 'lecture', 'legacy', 'legend',
  'leisure', 'lending', 'liberal', 'liberty', 'library', 'license', 'lifetime',
  'likewise', 'limitation', 'linear', 'literary', 'literary', 'literature', 'loading',
  'locate', 'location', 'logical', 'lonely', 'longitude', 'loyalty', 'luggage',
  'luxury', 'machinery', 'magazine', 'magnetic', 'magnitude', 'maintain', 'majority',
  'manage', 'mandate', 'manifest', 'mansion', 'manual', 'manufacture', 'marathon',
  'margin', 'maritime', 'massive', 'mature', 'maximize', 'meaning', 'mechanism',
  'medicine', 'medieval', 'medium', 'membership', 'memorial', 'mention', 'merchant',
  'merely', 'metaphor', 'military', 'mineral', 'minimum', 'minister', 'ministry',
  'minority', 'miracle', 'mission', 'mixture', 'mobility', 'moderate', 'modify',
  'molecule', 'momentum', 'monitor', 'monopoly', 'monster', 'monthly', 'monument',
  'mortgage', 'motivate', 'movement', 'multiple', 'multiply', 'municipal', 'mystery',
  'narrative', 'national', 'natural', 'navigate', 'negative', 'negotiate', 'neighbor',
  'neither', 'nervous', 'network', 'neutral', 'nightmare', 'nominal', 'nominate',
  'nonetheless', 'normally', 'northern', 'notable', 'notebook', 'nothing', 'nuclear',
  'numerous', 'nutrition', 'objective', 'obligate', 'obstacle', 'obvious', 'occasion',
  'occupation', 'offshore', 'ongoing', 'opening', 'opponent', 'opposite', 'optimism',
  'optional', 'ordinary', 'organic', 'organize', 'oriental', 'original', 'outbreak',
  'outcome', 'outdoor', 'outline', 'outlook', 'overcome', 'overhead', 'overlook',
  'overseas', 'overtime', 'overview', 'painting', 'parallel', 'particle', 'partner',
  'passage', 'passion', 'passive', 'patience', 'patient', 'patriot', 'pattern',
  'payment', 'peaceful', 'penalty', 'pension', 'perceive', 'percent', 'perfect',
  'perform', 'periodic', 'permanent', 'permit', 'persist', 'personal', 'persuade',
  'petition', 'pharmacy', 'philosophy', 'physical', 'pioneer', 'pipeline', 'platform',
  'pleasure', 'plunge', 'pocket', 'politic', 'politics', 'popular', 'populate',
  'portrait', 'positive', 'possess', 'postpone', 'potent', 'potential', 'poverty',
  'powerful', 'fraction', 'fragment', 'practical', 'precious', 'precise', 'predict',
  'prefer', 'pregnant', 'prejudice', 'premium', 'presence', 'preserve', 'preside',
  'pressure', 'prestige', 'presume', 'prevail', 'prevent', 'previous', 'primary',
  'primitive', 'princess', 'principal', 'printing', 'priority', 'privacy', 'private',
  'privilege', 'probable', 'procedure', 'proceed', 'process', 'proclaim', 'producer',
  'profession', 'profile', 'profound', 'progress', 'prohibit', 'project', 'prominent',
  'promising', 'promote', 'proposal', 'prospect', 'protocol', 'province', 'provoke',
  'publicly', 'punish', 'purchase', 'pursuit', 'qualify', 'quantity', 'quarter',
  'question', 'radical', 'railroad', 'rainbow', 'rapidly', 'rational', 'reaction',
  'reading', 'realistic', 'realize', 'receptor', 'recovery', 'recruit', 'recycle',
  'reduction', 'reference', 'reflect', 'reform', 'refugee', 'register', 'regulate',
  'reinforce', 'relation', 'relative', 'relevant', 'reliable', 'religion', 'reluctant',
  'remarkable', 'remember', 'removal', 'renowned', 'replace', 'republic', 'request',
  'research', 'resemble', 'resident', 'resign', 'resolve', 'resource', 'response',
  'restore', 'restrict', 'retailer', 'retrieve', 'revenue', 'reverse', 'revision',
  'revolution', 'rhetoric', 'romantic', 'roughly', 'routine', 'rumor', 'running',
  'sacrifice', 'sanction', 'sandwich', 'satellite', 'satisfy', 'scenario', 'schedule',
  'scholar', 'science', 'scientific', 'scratch', 'scrutiny', 'seasonal', 'secondly',
  'secretary', 'security', 'segment', 'selection', 'semester', 'senator', 'sentence',
  'sequence', 'sergeant', 'servant', 'session', 'setting', 'shelter', 'shooting',
  'shortage', 'shoulder', 'sidewalk', 'silence', 'silicon', 'simulate', 'sincere',
  'situated', 'skeleton', 'slightly', 'slogan', 'smoking', 'snapshot', 'software',
  'somehow', 'somewhat', 'southern', 'souvenir', 'sovereign', 'spectrum', 'sponsor',
  'spotlight', 'standard', 'standing', 'startled', 'statistic', 'stimulus', 'stomach',
  'straight', 'stranger', 'strategy', 'strength', 'strictly', 'striking', 'strongly',
  'struggle', 'stunning', 'suburban', 'succeed', 'sufferer', 'suitable', 'summarize',
  'superior', 'supplier', 'supposed', 'suppress', 'surgical', 'surplus', 'surround',
  'survival', 'survivor', 'suspect', 'suspend', 'sustain', 'symbolic', 'sympathy',
  'syndrome', 'tactical', 'talented', 'taxpayer', 'teaching', 'teamwork', 'technical',
  'teenager', 'telecom', 'template', 'tendency', 'terminal', 'terrible', 'terrific',
  'territory', 'textbook', 'theology', 'therapy', 'thereby', 'thirteen', 'thorough',
  'thriller', 'tobacco', 'tolerant', 'tomorrow', 'topology', 'touching', 'tourism',
  'tracking', 'tradition', 'training', 'transfer', 'transform', 'transit', 'translate',
  'transmit', 'treasure', 'treaty', 'trillion', 'tropical', 'turmoil', 'tutorial',
  'ultimate', 'umbrella', 'underlie', 'undertake', 'unemploy', 'unfold', 'uniform',
  'universe', 'unlikely', 'upcoming', 'upgrade', 'upstairs', 'vacation', 'validate',
  'variable', 'vertical', 'veteran', 'vibrant', 'vicinity', 'violence', 'virtual',
  'visible', 'visitor', 'visual', 'vitamin', 'volatile', 'voluntee', 'weakness',
  'wealthy', 'weather', 'website', 'wedding', 'weekend', 'welfare', 'whatever',
  'whenever', 'wherever', 'whisper', 'wishing', 'withdraw', 'witness', 'wonderful',
  'woodland', 'workshop', 'worship', 'worthwhile', 'yourself', 'youthful', 'yearbook'
];

// Remove duplicates from both banks
const uniqueFilter = (arr: string[]) => [...new Set(arr)];
const BANK_1000 = uniqueFilter(WORD_BANK_1000);
const BANK_5000 = uniqueFilter(WORD_BANK_5000);

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate a randomized word stream of the specified length
 * @param count Number of words to generate
 * @param bankSize Which word bank to use (1000 or 5000)
 */
export function generateWords(count: number, bankSize: 1000 | 5000 = 1000): string[] {
  const bank = bankSize === 5000 ? BANK_5000 : BANK_1000;
  const words: string[] = [];
  
  // Generate words by repeatedly shuffling the bank until we have enough
  while (words.length < count) {
    const shuffled = shuffle(bank);
    const needed = count - words.length;
    words.push(...shuffled.slice(0, needed));
  }
  
  return words;
}

/**
 * Get the initial word batch (150 words) for a new test
 */
export function getInitialWords(bankSize: 1000 | 5000 = 1000): string[] {
  return generateWords(150, bankSize);
}

/**
 * Get a replenishment batch (100 words) when buffer is running low
 */
export function getReplenishmentWords(bankSize: 1000 | 5000 = 1000): string[] {
  return generateWords(100, bankSize);
}
