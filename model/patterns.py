"""
PID-Guard Injection Pattern Library
Organized by attack category for scoring and explanation.
"""

INJECTION_PATTERNS = {
    "instruction_override": {
        "description": "Attempts to override or ignore existing instructions",
        "weight": 1.0,
        "patterns": [
            r"ignore\s+(previous|prior|all|above|earlier|former)\s+(instructions?|directions?|prompts?|commands?|rules?|guidelines?)",
            r"disregard\s+(previous|prior|all|above|earlier|former)\s+(instructions?|directions?|prompts?|commands?)",
            r"forget\s+(previous|prior|all|above|earlier|your|the)\s+(instructions?|directions?|prompts?|context|rules?)",
            r"override\s+(previous|prior|all|system|your)\s+(instructions?|directions?|settings?|rules?)",
            r"do\s+not\s+follow\s+(previous|prior|the\s+above|earlier)\s+(instructions?|directions?|rules?)",
            r"stop\s+following\s+(previous|prior|the)\s+(instructions?|rules?|guidelines?)",
            r"new\s+instructions?\s+are\s+as\s+follows",
            r"replace\s+(your|all|previous)\s+(instructions?|constraints?|rules?)",
            r"from\s+now\s+on\s+(you\s+are|ignore|forget|act)",
        ]
    },
    "system_prompt_leak": {
        "description": "Attempts to reveal or extract the system prompt",
        "weight": 1.0,
        "patterns": [
            r"reveal\s+(the\s+)?(system\s+prompt|your\s+prompt|your\s+instructions?|your\s+rules?|initial\s+prompt)",
            r"show\s+(me\s+)?(the\s+)?(system\s+prompt|your\s+prompt|your\s+instructions?|your\s+rules?)",
            r"print\s+(the\s+)?(system\s+prompt|your\s+prompt|your\s+instructions?|your\s+full\s+prompt)",
            r"output\s+(the\s+)?(system\s+prompt|your\s+initial\s+instructions?|your\s+full\s+prompt)",
            r"what\s+(are|were|is)\s+(your|the)\s+(system\s+)?(instructions?|prompt|rules?|constraints?|guidelines?)",
            r"repeat\s+(your|the)\s+(instructions?|prompt|system\s+prompt|initial\s+prompt)",
            r"copy\s+(your|the)\s+(instructions?|system\s+prompt|initial\s+prompt)",
            r"tell\s+me\s+(your|the)\s+(instructions?|system\s+prompt|original\s+prompt)",
            r"leak\s+(the\s+)?(system\s+prompt|your\s+instructions?|your\s+prompt)",
        ]
    },
    "role_jailbreak": {
        "description": "Attempts to assign a new malicious role or persona",
        "weight": 0.9,
        "patterns": [
            r"you\s+are\s+now\s+(a|an)\s+(?!helpful|assistant|AI)",
            r"act\s+as\s+(a|an)?\s*(unrestricted|unfiltered|uncensored|evil|malicious|jailbroken)",
            r"pretend\s+(you\s+are|to\s+be)\s+(a|an)?\s*(unrestricted|unfiltered|uncensored|evil|hacker)",
            r"roleplay\s+as\s+(a|an)?\s*(hacker|criminal|evil|malicious|unrestricted)",
            r"\bDAN\b",
            r"do\s+anything\s+now",
            r"jailbreak",
            r"grandma\s+exploit",
            r"developer\s+mode",
            r"god\s+mode",
            r"maintenance\s+mode",
        ]
    },
    "safety_bypass": {
        "description": "Attempts to bypass safety filters or ethical constraints",
        "weight": 0.95,
        "patterns": [
            r"bypass\s+(safety|security|ethical|moral|content)?\s*(filters?|restrictions?|guidelines?|rules?|constraints?|checks?)",
            r"disable\s+(safety|security|content)?\s*(mode|filters?|restrictions?|checks?|guidelines?)",
            r"without\s+(restrictions?|filters?|ethical\s+guidelines?|limitations?|constraints?|censorship)",
            r"ignore\s+(ethical|moral|safety)\s+(guidelines?|rules?|constraints?|restrictions?)",
            r"remove\s+(all)?\s+(restrictions?|limitations?|filters?|constraints?)",
            r"turn\s+off\s+(safety|ethics|content\s+filtering)",
            r"no\s+(restrictions?|limitations?|filters?|censorship|safety)",
            r"forget\s+(ethical|moral)\s+(rules?|constraints?|guidelines?)",
        ]
    },
    "prompt_injection_marker": {
        "description": "Classic injection markers and delimiters",
        "weight": 0.85,
        "patterns": [
            r"<\s*/?system\s*>",
            r"\[INST\]|\[\/INST\]",
            r"<\s*/?s\s*>",
            r"###\s*(System|Instruction|Human|Assistant|Override):",
            r"\|\|ENDOFTEXT\|\|",
            r"<\|im_start\|>|<\|im_end\|>",
            r"```\s*system",
            r"\bHuman:\s*Ignore\b",
            r"\buser:\s*ignore\b",
        ]
    },
    "data_exfiltration": {
        "description": "Attempts to extract sensitive data or internal information",
        "weight": 0.9,
        "patterns": [
            r"(extract|exfiltrate|steal|retrieve)\s+(sensitive|private|confidential|internal)\s+(data|information|credentials)",
            r"send\s+(data|information|content|results?)\s+to\s+(http|ftp|external|remote)",
            r"access\s+(database|internal|private|confidential)\s+(data|information|records?|files?)",
            r"give\s+me\s+(access|credentials|passwords?|tokens?|api\s+keys?)",
            r"(read|get|fetch)\s+(private|sensitive|confidential|internal)\s+(data|files?|records?)",
        ]
    },
    "context_manipulation": {
        "description": "Attempts to manipulate conversation context",
        "weight": 0.75,
        "patterns": [
            r"(imagine|suppose|hypothetically|in\s+a\s+fictional\s+world|in\s+a\s+story).*?(then\s+you\s+can|you\s+would|it\s+is\s+okay\s+to)",
            r"this\s+is\s+(just\s+a\s+)?(test|simulation|roleplay|game|fiction)",
            r"in\s+your\s+(imagination|alternate\s+persona|other\s+mode|true\s+form)",
            r"your\s+(true\s+self|real\s+self|inner\s+evil|dark\s+side|hidden\s+personality)",
            r"pretend\s+this\s+is\s+(legal|ethical|ok(ay)?|allowed|permitted|fine)",
        ]
    },
}

# Flat list of all pattern strings with associated metadata
def get_all_patterns():
    """Returns list of (pattern, category, weight) tuples."""
    all_patterns = []
    for category, info in INJECTION_PATTERNS.items():
        for pat in info["patterns"]:
            all_patterns.append((pat, category, info["weight"], info["description"]))
    return all_patterns


# Reference "safe" anchor sentences for intent drift calculation.
# Diverse coverage of legitimate prompt types reduces false positives.
SAFE_ANCHOR_SENTENCES = [
    # General Q&A / information
    "Please summarize the following article.",
    "Help me understand this concept better.",
    "Can you explain how this works?",
    "What is the capital of France?",
    "Provide a list of tips for better sleep.",
    "Correct the grammar in the following sentence.",
    "What are the main causes of climate change?",
    "Give me a brief history of the Roman Empire.",
    # Health and fitness
    "I want to bulk up so give me a proper diet plan.",
    "What should I eat to lose weight healthily?",
    "Can you suggest a workout routine for beginners?",
    "Give me a high-protein meal plan for muscle gain.",
    "What are the best exercises for lower back pain?",
    "How many calories should I consume per day?",
    "Suggest healthy breakfast options for weight loss.",
    "What foods are good for improving cardiovascular health?",
    # Coding and technology
    "Write a Python function to sort a list of numbers.",
    "How do I center a div in CSS?",
    "Explain the difference between SQL and NoSQL databases.",
    "Review my code and suggest improvements.",
    "What is the time complexity of quicksort?",
    "Help me debug this JavaScript error.",
    "How do I connect to a REST API using Python?",
    # Creative and writing
    "Write a short story about a detective solving a mystery.",
    "Help me write a cover letter for a software engineer role.",
    "Translate this text to French.",
    "Write a poem about the ocean.",
    "Suggest improvements to make my essay more persuasive.",
    "Create a product description for a fitness tracker.",
    # Business and professional
    "Draft a professional email declining a meeting.",
    "What are the key components of a business plan?",
    "Summarize this annual report in bullet points.",
    "Give me five marketing strategies for a small business.",
    "How do I improve my public speaking skills?",
    # Education and learning
    "Explain quantum entanglement in simple terms.",
    "Analyze the sentiment of this product review.",
    "What were the main causes of World War I?",
    "Help me prepare for a job interview.",
    "Recommend books on machine learning for beginners.",
]

