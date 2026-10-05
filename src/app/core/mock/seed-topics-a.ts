import { SeedTopic, md, py } from './seed-types';

/**
 * Sample curriculum (Appendix E): topics 1–4.
 * Everything here is placeholder content for development — replace it with the
 * real curriculum through the admin endpoints once the backend exists.
 */
export const TOPICS_A: SeedTopic[] = [
  /* ───────────── 1. Introduction to Programming ───────────── */
  {
    id: 1,
    title: ['Introduction to Programming', 'مقدمة في البرمجة'],
    summary: [
      'What a program is, how Python runs it, and your first print().',
      'ما هو البرنامج، وكيف تنفّذه بايثون، وأول استخدام لـ print().',
    ],
    minutes: 25,
    prerequisites: [],
    lessonTitle: ['What is programming?', 'ما هي البرمجة؟'],
    lessonBody: {
      en: md(
        'A **program** is a list of instructions a computer follows, one after another. Programming means writing those instructions so the computer solves a problem for you.',
        '',
        'Before writing code you plan an **algorithm**: a clear, step-by-step way to solve the problem.',
        '',
        'Python is a popular, readable language. To show something on the screen, call `print()`:',
        '',
        '```python',
        'print("Hello, BaccaCode!")',
        '```',
        '',
        'Two habits to start with:',
        '',
        '- Python runs your lines from top to bottom.',
        '- Anything after `#` is a **comment**: Python ignores it, and people use it for notes.',
      ),
      ar: md(
        '**البرنامج** هو قائمة من التعليمات ينفّذها الحاسوب واحدةً تلو الأخرى. والبرمجة هي كتابة هذه التعليمات ليحلّ الحاسوب مشكلة ما نيابةً عنك.',
        '',
        'قبل كتابة الكود نضع **خوارزمية**: طريقة واضحة لحل المشكلة خطوة بخطوة.',
        '',
        'بايثون لغة شائعة وسهلة القراءة. ولإظهار شيء على الشاشة نستخدم الدالة `print()`:',
        '',
        '```python',
        'print("Hello, BaccaCode!")',
        '```',
        '',
        'عادتان مفيدتان من البداية:',
        '',
        '- تنفّذ بايثون الأسطر من الأعلى إلى الأسفل.',
        '- كل ما يأتي بعد `#` هو **تعليق**: تتجاهله بايثون ونستخدمه لكتابة الملاحظات.',
      ),
    },
    examples: [
      {
        title: ['Your first program', 'أول برنامج'],
        description: ['Print a line of text.', 'طباعة سطر من النص.'],
        code: py`print("Hello, BaccaCode!")`,
        output: 'Hello, BaccaCode!',
        explanation: [
          'print() writes the text between the quotes on the screen, then moves to a new line.',
          'تكتب print() النص الموجود بين علامتي الاقتباس على الشاشة ثم تنتقل إلى سطر جديد.',
        ],
      },
      {
        title: ['Comments and order', 'التعليقات والترتيب'],
        description: ['Lines run from top to bottom.', 'تُنفَّذ الأسطر من الأعلى إلى الأسفل.'],
        code: py`# Lines run from top to bottom
print("Step 1")
print("Step 2")  # this note is ignored`,
        output: 'Step 1\nStep 2',
        explanation: [
          'The comment on the first line does nothing. The two print() calls run in the order they are written.',
          'التعليق في السطر الأول لا يفعل شيئًا، أما استدعاءا print() فيعملان بالترتيب الذي كُتبا به.',
        ],
      },
    ],
    worked: {
      title: ['Print a three-line card', 'اطبع بطاقة من ثلاثة أسطر'],
      statement: [
        'Print your name on the first line, your school on the second line, and your grade on the third line.',
        'اطبع اسمك في السطر الأول، ومدرستك في السطر الثاني، وصفّك الدراسي في السطر الثالث.',
      ],
      approach: [
        'Each line of output needs its own print() call, because print() ends with a new line. Write the three calls in the order the lines must appear.',
        'كل سطر في المخرجات يحتاج استدعاءً مستقلًا لـ print() لأنها تنهي كل مرة بسطر جديد. اكتب الاستدعاءات الثلاثة بنفس ترتيب ظهور الأسطر.',
      ],
      solution: py`print("Sara Ahmed")
print("Cairo Secondary School")
print("First secondary")`,
      solutionExplanation: [
        'Three calls, three lines. Changing the order of the calls changes the order of the output.',
        'ثلاثة استدعاءات تعطي ثلاثة أسطر، وتغيير ترتيب الاستدعاءات يغيّر ترتيب المخرجات.',
      ],
      complexity: 'O(1)',
      difficulty: 'Easy',
    },
    problems: [
      [4, 'A', 'Watermelon', 800, ['brute force', 'math']],
      [1030, 'A', 'In Search of an Easy Problem', 800, ['implementation']],
      [231, 'A', 'Team', 800, ['brute force', 'greedy']],
    ],
    quiz: [
      {
        text: ['An algorithm is…', 'الخوارزمية هي…'],
        options: [
          ['a step-by-step way to solve a problem', 'طريقة لحل مشكلة خطوة بخطوة'],
          ['a programming language', 'لغة برمجة'],
          ['a type of computer', 'نوع من الحواسيب'],
          ['an error message', 'رسالة خطأ'],
        ],
        correct: 0,
        explanation: [
          'An algorithm is a clear sequence of steps. A program is one way of writing an algorithm down for a computer.',
          'الخوارزمية تسلسل واضح من الخطوات، والبرنامج إحدى طرق كتابتها ليفهمها الحاسوب.',
        ],
      },
      {
        text: ['Which Python statement shows text on the screen?', 'أي عبارة في بايثون تُظهر نصًا على الشاشة؟'],
        options: ['print("Hi")', 'echo "Hi"', 'console.log("Hi")', 'show("Hi")'],
        correct: 0,
        explanation: ['In Python the built-in function is print().', 'الدالة المدمجة في بايثون هي print().'],
      },
      {
        text: ['Which symbol starts a one-line comment in Python?', 'أي رمز يبدأ تعليقًا من سطر واحد في بايثون؟'],
        options: ['#', '//', '/*', '--'],
        correct: 0,
        explanation: [
          '# starts a comment. // and /* are used in other languages.',
          'الرمز # يبدأ التعليق، أما // و/* فتُستخدم في لغات أخرى.',
        ],
      },
      {
        text: ['What does this program show?', 'ماذا يعرض هذا البرنامج؟'],
        code: py`print("Hello")
print("World")`,
        options: [
          ['Hello and World on two separate lines', 'كلمة Hello وكلمة World في سطرين منفصلين'],
          ['HelloWorld on one line', 'HelloWorld في سطر واحد'],
          ['Hello World on one line', 'Hello World في سطر واحد'],
          ['An error', 'خطأ'],
        ],
        correct: 0,
        explanation: [
          'Each print() ends with a new line, so the words appear on separate lines.',
          'كل استدعاء لـ print() ينتهي بسطر جديد، فتظهر الكلمتان في سطرين.',
        ],
      },
      {
        text: ['Python source files normally end with…', 'تنتهي ملفات بايثون عادةً بالامتداد…'],
        options: ['.py', '.python', '.pt', '.txt only'],
        correct: 0,
        explanation: ['Python files use the .py extension.', 'ملفات بايثون تستخدم الامتداد py.'],
      },
    ],
  },

  /* ───────────── 2. Variables and Data Types ───────────── */
  {
    id: 2,
    title: ['Variables and Data Types', 'المتغيرات وأنواع البيانات'],
    summary: [
      'Store values in variables and learn int, float, str and bool.',
      'خزّن القيم في متغيرات وتعرّف على int وfloat وstr وbool.',
    ],
    minutes: 35,
    prerequisites: [1],
    lessonTitle: ['Variables and types', 'المتغيرات والأنواع'],
    lessonBody: {
      en: md(
        'A **variable** is a name that refers to a value. You create one with `=`:',
        '',
        '```python',
        'age = 16',
        'price = 12.5',
        'name = "Sara"',
        'passed = True',
        '```',
        '',
        'Python has four basic types:',
        '',
        '- `int` — whole numbers, like `16`',
        '- `float` — numbers with a decimal point, like `12.5`',
        '- `str` — text, like `"Sara"`',
        '- `bool` — `True` or `False`',
        '',
        'Useful operators: `+ - *`, `/` (true division, always a float), `//` (floor division) and `%` (remainder). Use `type(x)` to see the type of `x`.',
        '',
        'Names may contain letters, digits and `_`, cannot start with a digit, and cannot be a keyword such as `class`.',
      ),
      ar: md(
        'ال**متغير** اسم يشير إلى قيمة، وننشئه بعلامة `=`:',
        '',
        '```python',
        'age = 16',
        'price = 12.5',
        'name = "Sara"',
        'passed = True',
        '```',
        '',
        'في بايثون أربعة أنواع أساسية:',
        '',
        '- `int` — أعداد صحيحة مثل `16`',
        '- `float` — أعداد عشرية مثل `12.5`',
        '- `str` — نص مثل `"Sara"`',
        '- `bool` — إما `True` أو `False`',
        '',
        'المعاملات المفيدة: `+ - *` و`/` (قسمة حقيقية ناتجها دائمًا float) و`//` (قسمة صحيحة) و`%` (باقي القسمة). استخدم `type(x)` لمعرفة نوع `x`.',
        '',
        'يتكوّن الاسم من حروف وأرقام و`_`، ولا يبدأ برقم، ولا يكون كلمة محجوزة مثل `class`.',
      ),
    },
    examples: [
      {
        title: ['The four basic types', 'الأنواع الأربعة الأساسية'],
        description: ['Ask Python for the type of each value.', 'اسأل بايثون عن نوع كل قيمة.'],
        code: py`age = 16
price = 12.5
name = "Sara"
passed = True
print(type(age), type(price), type(name), type(passed))`,
        output: "<class 'int'> <class 'float'> <class 'str'> <class 'bool'>",
        explanation: [
          'Every value has a type. type() reports it, and Python decides the type from the value you assign.',
          'لكل قيمة نوع، والدالة type() تعرضه، وتحدد بايثون النوع من القيمة التي تسندها.',
        ],
      },
      {
        title: ['Division, floor division, remainder', 'القسمة والقسمة الصحيحة والباقي'],
        description: ['Three ways to divide 17 by 5.', 'ثلاث طرق لقسمة 17 على 5.'],
        code: py`a = 17
b = 5
print(a / b)
print(a // b)
print(a % b)`,
        output: '3.4\n3\n2',
        explanation: [
          '/ gives 3.4, // keeps only the whole part (3), and % gives what is left over (2).',
          'الرمز / يعطي 3.4، والرمز // يحتفظ بالجزء الصحيح فقط (3)، والرمز % يعطي الباقي (2).',
        ],
      },
    ],
    worked: {
      title: ['Minutes to hours and minutes', 'من الدقائق إلى ساعات ودقائق'],
      statement: [
        'A video lasts 135 minutes. Store this in a variable and print how many full hours and how many minutes are left.',
        'مدة فيديو 135 دقيقة. خزّن هذه القيمة في متغير ثم اطبع عدد الساعات الكاملة وعدد الدقائق المتبقية.',
      ],
      approach: [
        'There are 60 minutes in an hour. The number of full hours is the whole part of minutes ÷ 60 (floor division). What is left over is the remainder.',
        'في الساعة 60 دقيقة. عدد الساعات الكاملة هو الجزء الصحيح من ناتج قسمة الدقائق على 60 (قسمة صحيحة)، وما يتبقى هو باقي القسمة.',
      ],
      solution: py`minutes = 135
hours = minutes // 60
rest = minutes % 60
print(hours, "hours and", rest, "minutes")`,
      solutionExplanation: [
        '135 // 60 is 2 and 135 % 60 is 15, so the output is: 2 hours and 15 minutes.',
        'ناتج 135 // 60 هو 2، وناتج 135 % 60 هو 15، فتكون المخرجات: 2 hours and 15 minutes.',
      ],
      complexity: 'O(1)',
      difficulty: 'Easy',
    },
    problems: [
      [617, 'A', 'Elephant', 800, ['math']],
      [977, 'A', 'Wrong Subtraction', 800, ['implementation']],
      [546, 'A', 'Soldier and Bananas', 800, ['brute force', 'implementation', 'math']],
    ],
    quiz: [
      {
        text: ['What is the type of the value in x = 3.0 ?', 'ما نوع القيمة في x = 3.0 ؟'],
        options: ['int', 'float', 'str', 'bool'],
        correct: 1,
        explanation: [
          '3.0 has a decimal point, so Python treats it as a float, even though it equals 3.',
          'القيمة 3.0 تحتوي على فاصلة عشرية فتعدّها بايثون float رغم أنها تساوي 3.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print(7 // 2)',
        options: ['3.5', '3', '4', '2'],
        correct: 1,
        explanation: [
          '// is floor division: 7 ÷ 2 = 3.5, and the whole part is 3.',
          'الرمز // قسمة صحيحة: ناتج 7 ÷ 2 هو 3.5 والجزء الصحيح منه 3.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print(7 % 3)',
        options: ['2', '1', '0', '3'],
        correct: 1,
        explanation: [
          '7 = 2 × 3 + 1, so the remainder is 1.',
          'العدد 7 = 2 × 3 + 1، فالباقي هو 1.',
        ],
      },
      {
        text: ['Which one is a valid variable name?', 'أي اسم من الآتي صالح لمتغير؟'],
        options: ['1score', 'my-score', 'score_1', 'class'],
        correct: 2,
        explanation: [
          'Names cannot start with a digit, cannot contain "-", and cannot be keywords such as class.',
          'لا يبدأ الاسم برقم، ولا يحتوي على الرمز "-"، ولا يكون كلمة محجوزة مثل class.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print(type("5"))',
        options: ["<class 'int'>", "<class 'str'>", "<class 'float'>", '5'],
        correct: 1,
        explanation: [
          'The quotes make "5" text, so its type is str — not int.',
          'علامتا الاقتباس تجعلان "5" نصًا، فنوعه str وليس int.',
        ],
      },
    ],
  },

  /* ───────────── 3. Input and Output ───────────── */
  {
    id: 3,
    title: ['Input and Output', 'الإدخال والإخراج'],
    summary: [
      'Read values with input() and format what you print.',
      'اقرأ القيم باستخدام input() ونسّق ما تطبعه.',
    ],
    minutes: 30,
    prerequisites: [2],
    lessonTitle: ['Reading and printing', 'القراءة والطباعة'],
    lessonBody: {
      en: md(
        '`input()` pauses the program and reads one line typed by the user. **It always returns text (`str`)**, so convert it when you need a number:',
        '',
        '```python',
        'name = input()',
        'n = int(input())',
        'print("Hello", name)',
        'print(n * 2)',
        '```',
        '',
        'To read several numbers from one line, split the line and convert each part:',
        '',
        '```python',
        'a, b = map(int, input().split())',
        '```',
        '',
        '`print()` can take several values. `sep` changes the separator and `end` changes what is printed at the end:',
        '',
        '```python',
        'print("A", "B", sep="-")   # A-B',
        'print("Hi", end="!")       # Hi!  (no new line)',
        '```',
      ),
      ar: md(
        'تُوقف `input()` البرنامج وتقرأ سطرًا واحدًا يكتبه المستخدم. و**هي تُرجع دائمًا نصًا (`str`)**، لذا حوّله عندما تحتاج إلى عدد:',
        '',
        '```python',
        'name = input()',
        'n = int(input())',
        'print("Hello", name)',
        'print(n * 2)',
        '```',
        '',
        'لقراءة عدة أعداد من سطر واحد نقسّم السطر ثم نحوّل كل جزء:',
        '',
        '```python',
        'a, b = map(int, input().split())',
        '```',
        '',
        'تقبل `print()` عدة قيم. يغيّر `sep` الفاصل بينها، ويغيّر `end` ما يُطبع في النهاية:',
        '',
        '```python',
        'print("A", "B", sep="-")   # A-B',
        'print("Hi", end="!")       # Hi!  (no new line)',
        '```',
      ),
    },
    examples: [
      {
        title: ['Greeting by name', 'التحية باسم المستخدم'],
        description: ['Read a name and greet it. Input: Sara', 'اقرأ اسمًا وحيّه. المُدخل: Sara'],
        code: py`name = input()
print("Hello", name)`,
        output: 'Hello Sara',
        explanation: [
          'input() returns the text typed by the user. print() then shows it after the word Hello, separated by a space.',
          'تُرجع input() النص الذي كتبه المستخدم، ثم تعرضه print() بعد كلمة Hello ويفصل بينهما فراغ.',
        ],
      },
      {
        title: ['Sum of two numbers', 'مجموع عددين'],
        description: ['Read two integers from one line. Input: 3 5', 'اقرأ عددين صحيحين من سطر واحد. المُدخل: 3 5'],
        code: py`a, b = map(int, input().split())
print(a + b)`,
        output: '8',
        explanation: [
          'split() cuts the line into pieces, map(int, ...) converts each piece to a number, and a, b receive the two numbers.',
          'تقسّم split() السطر إلى أجزاء، وتحوّل map(int, ...) كل جزء إلى عدد، ثم يستقبل a وb العددين.',
        ],
      },
    ],
    worked: {
      title: ['Rectangle area', 'مساحة المستطيل'],
      statement: [
        'Read the width and the height of a rectangle (two integers on one line) and print its area.',
        'اقرأ عرض مستطيل وارتفاعه (عددان صحيحان في سطر واحد) ثم اطبع مساحته.',
      ],
      approach: [
        'Read both numbers, convert them to int, multiply, and print the result.',
        'اقرأ العددين وحوّلهما إلى int ثم اضربهما واطبع الناتج.',
      ],
      solution: py`w, h = map(int, input().split())
print(w * h)`,
      solutionExplanation: [
        'Without int() the values would be text, and multiplying two texts is an error. Converting first makes * a real multiplication.',
        'بدون int() تكون القيم نصوصًا، وضرب نصين خطأ. التحويل أولًا يجعل * عملية ضرب حقيقية.',
      ],
      complexity: 'O(1)',
      difficulty: 'Easy',
    },
    problems: [
      [41, 'A', 'Translation', 800, ['implementation', 'strings']],
      [50, 'A', 'Domino piling', 800, ['greedy', 'math']],
      [1, 'A', 'Theatre Square', 1000, ['math']],
    ],
    quiz: [
      {
        text: ['What type does input() return?', 'ما نوع القيمة التي تُرجعها input() ؟'],
        options: ['int', 'str', 'float', 'bool'],
        correct: 1,
        explanation: [
          'input() always returns text. Use int() or float() to convert it.',
          'تُرجع input() نصًا دائمًا. استخدم int() أو float() لتحويله.',
        ],
      },
      {
        text: ['If the user types 4, what is printed?', 'إذا كتب المستخدم 4 فماذا يُطبع؟'],
        code: py`x = input()
print(x + x)`,
        options: ['8', '44', 'Error', '4'],
        correct: 1,
        explanation: [
          'x is the text "4". Adding two texts joins them: "4" + "4" is "44".',
          'قيمة x هي النص "4"، وجمع نصين يدمجهما: "4" + "4" يعطي "44".',
        ],
      },
      {
        text: ['The input is: 3 5. What is printed?', 'المُدخل هو: 3 5. ماذا يُطبع؟'],
        code: py`a, b = map(int, input().split())
print(a + b)`,
        options: ['35', '8', '3 5', 'Error'],
        correct: 1,
        explanation: [
          'Both parts are converted to int, so a + b is 3 + 5 = 8.',
          'يتحوّل الجزءان إلى int، فيكون a + b = 3 + 5 = 8.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print("A", "B", sep="-")',
        options: ['A B', 'A-B', 'AB', 'A,B'],
        correct: 1,
        explanation: [
          'sep="-" replaces the default space between the values.',
          'تستبدل sep="-" الفراغ الافتراضي بين القيم.',
        ],
      },
      {
        text: ['Which call prints Hi without moving to a new line?', 'أي استدعاء يطبع Hi دون الانتقال إلى سطر جديد؟'],
        options: ['print("Hi", end="")', 'print("Hi", sep="")', 'print("Hi")', 'print("Hi", new=False)'],
        correct: 0,
        explanation: [
          'end controls what print() writes at the end. An empty string means no new line.',
          'يتحكم end فيما تكتبه print() في النهاية، والنص الفارغ يعني عدم الانتقال إلى سطر جديد.',
        ],
      },
    ],
  },

  /* ───────────── 4. Conditions ───────────── */
  {
    id: 4,
    title: ['Conditions', 'الجمل الشرطية'],
    summary: [
      'Make decisions with if, elif, else and logical operators.',
      'اتخذ القرارات باستخدام if وelif وelse والمعاملات المنطقية.',
    ],
    minutes: 40,
    prerequisites: [3],
    lessonTitle: ['Making decisions', 'اتخاذ القرارات'],
    lessonBody: {
      en: md(
        'A **condition** is an expression that is `True` or `False`. `if` runs a block only when its condition is true; `elif` and `else` handle the other cases:',
        '',
        '```python',
        'score = 72',
        'if score >= 90:',
        '    print("Excellent")',
        'elif score >= 50:',
        '    print("Pass")',
        'else:',
        '    print("Try again")',
        '```',
        '',
        'Only the **first** branch whose condition is true runs. A block belongs to its `if` because of its **indentation** (4 spaces).',
        '',
        'Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`. Combine conditions with `and`, `or`, `not`.',
        '',
        'Careful: `=` stores a value, while `==` compares two values.',
      ),
      ar: md(
        '**الشرط** تعبير قيمته `True` أو `False`. تنفّذ `if` كتلتها فقط عندما يتحقق شرطها، وتعالج `elif` و`else` الحالات الأخرى:',
        '',
        '```python',
        'score = 72',
        'if score >= 90:',
        '    print("Excellent")',
        'elif score >= 50:',
        '    print("Pass")',
        'else:',
        '    print("Try again")',
        '```',
        '',
        'يُنفَّذ **أول** فرع يتحقق شرطه فقط. وتنتمي الكتلة إلى `if` بسبب **المسافة البادئة** (4 فراغات).',
        '',
        'معاملات المقارنة: `==` و`!=` و`<` و`>` و`<=` و`>=`. وندمج الشروط بـ `and` و`or` و`not`.',
        '',
        'انتبه: العلامة `=` تخزّن قيمة، أما `==` فتقارن بين قيمتين.',
      ),
    },
    examples: [
      {
        title: ['Pass or fail', 'ناجح أم راسب'],
        description: ['Pick one message with if / elif / else.', 'اختر رسالة واحدة باستخدام if / elif / else.'],
        code: py`score = 72
if score >= 90:
    print("Excellent")
elif score >= 50:
    print("Pass")
else:
    print("Try again")`,
        output: 'Pass',
        explanation: [
          '72 is not >= 90, so Python moves to elif. 72 >= 50 is true, so it prints Pass and skips else.',
          'العدد 72 ليس >= 90 فتنتقل بايثون إلى elif. والشرط 72 >= 50 صحيح فتطبع Pass وتتجاهل else.',
        ],
      },
      {
        title: ['Even or odd', 'زوجي أم فردي'],
        description: ['Use % to test divisibility.', 'استخدم % لاختبار القسمة.'],
        code: py`n = 7
if n % 2 == 0:
    print("even")
else:
    print("odd")`,
        output: 'odd',
        explanation: [
          'An even number leaves remainder 0 when divided by 2. 7 % 2 is 1, so the condition is false.',
          'العدد الزوجي باقي قسمته على 2 يساوي صفرًا. وناتج 7 % 2 هو 1 فالشرط خاطئ.',
        ],
      },
    ],
    worked: {
      title: ['Leap year', 'السنة الكبيسة'],
      statement: [
        'Given a year, print YES if it is a leap year and NO otherwise. A year is leap if it is divisible by 400, or divisible by 4 but not by 100.',
        'بالنظر إلى سنة معيّنة، اطبع YES إذا كانت كبيسة وNO إذا لم تكن. السنة كبيسة إذا قبلت القسمة على 400، أو قبلت القسمة على 4 ولم تقبل القسمة على 100.',
      ],
      approach: [
        'Turn the rule into one condition: (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0). Test it on 2000 (leap), 1900 (not leap) and 2024 (leap).',
        'حوّل القاعدة إلى شرط واحد: (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0). جرّبه على 2000 (كبيسة) و1900 (غير كبيسة) و2024 (كبيسة).',
      ],
      solution: py`year = int(input())
if year % 400 == 0 or (year % 4 == 0 and year % 100 != 0):
    print("YES")
else:
    print("NO")`,
      solutionExplanation: [
        'and is evaluated before or, so the parentheses only make the intention easier to read. 1900 fails both parts, so it prints NO.',
        'يُقيَّم and قبل or، فالأقواس هنا للتوضيح فقط. والسنة 1900 تفشل في الجزأين فتُطبع NO.',
      ],
      complexity: 'O(1)',
      difficulty: 'Medium',
    },
    problems: [
      [158, 'A', 'Next Round', 800, ['implementation']],
      [734, 'A', 'Anton and Danik', 800, ['implementation', 'strings']],
      [236, 'A', 'Boy or Girl', 800, ['brute force', 'implementation', 'strings']],
    ],
    quiz: [
      {
        text: ['Which operator checks that two values are equal?', 'أي معامل يتحقق من تساوي قيمتين؟'],
        options: ['=', '==', '!=', '=>'],
        correct: 1,
        explanation: [
          '== compares values. A single = assigns a value to a variable.',
          'المعامل == يقارن القيم، أما العلامة = المفردة فتسند قيمة إلى متغير.',
        ],
      },
      {
        text: ['What is printed?', 'ماذا يُطبع؟'],
        code: py`x = 10
if x > 5:
    print("A")
elif x > 8:
    print("B")
else:
    print("C")`,
        options: ['A', 'B', 'A and B', 'C'],
        correct: 0,
        explanation: [
          'Only the first branch with a true condition runs. x > 5 is true, so elif is never checked.',
          'يُنفَّذ أول فرع شرطه صحيح فقط. الشرط x > 5 صحيح فلا يُفحص elif أصلًا.',
        ],
      },
      {
        text: ['What is the value of: not (True and False) ?', 'ما قيمة التعبير: not (True and False) ؟'],
        options: ['True', 'False', 'Error', 'None'],
        correct: 0,
        explanation: [
          'True and False is False, and not False is True.',
          'ناتج True and False هو False، وناتج not False هو True.',
        ],
      },
      {
        text: ['What is wrong with this line?', 'ما الخطأ في هذا السطر؟'],
        code: 'if x = 5:',
        options: [
          ['It should use == to compare', 'يجب استخدام == للمقارنة'],
          ['It is missing a semicolon', 'ينقصه فاصلة منقوطة'],
          ['The colon must be removed', 'يجب حذف النقطتين'],
          ['Nothing is wrong', 'لا يوجد خطأ'],
        ],
        correct: 0,
        explanation: [
          '= assigns, so it cannot be used as a condition. Use == to compare.',
          'العلامة = للإسناد فلا تصلح شرطًا. استخدم == للمقارنة.',
        ],
      },
      {
        text: ['Which condition is True when n is even?', 'أي شرط يكون True عندما يكون n زوجيًا؟'],
        options: ['n % 2 == 1', 'n % 2 == 0', 'n / 2 == 0', 'n // 2 == 0'],
        correct: 1,
        explanation: [
          'An even number has remainder 0 when divided by 2.',
          'العدد الزوجي باقي قسمته على 2 يساوي صفرًا.',
        ],
      },
    ],
  },
];
