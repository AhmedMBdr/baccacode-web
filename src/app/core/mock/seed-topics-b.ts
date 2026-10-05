import { SeedTopic, md, py } from './seed-types';

/** Sample curriculum (Appendix E): topics 5–8. Placeholder content for development. */
export const TOPICS_B: SeedTopic[] = [
  /* ───────────── 5. Loops ───────────── */
  {
    id: 5,
    title: ['Loops', 'الحلقات التكرارية'],
    summary: [
      'Repeat work with for, while, break and continue.',
      'كرّر العمل باستخدام for وwhile وbreak وcontinue.',
    ],
    minutes: 45,
    prerequisites: [4],
    lessonTitle: ['Repeating work', 'تكرار العمل'],
    lessonBody: {
      en: md(
        'A **loop** repeats a block of code. Use `for` when you know how many times to repeat, and `while` when you repeat until a condition becomes false.',
        '',
        '```python',
        'for i in range(3):',
        '    print(i)        # 0, 1, 2',
        '',
        'count = 3',
        'while count > 0:',
        '    print(count)',
        '    count -= 1',
        '```',
        '',
        '`range(start, stop, step)` stops **before** `stop`: `range(1, 10, 3)` gives 1, 4, 7.',
        '',
        '`break` leaves the loop immediately. `continue` skips to the next round.',
        '',
        'Every `while` loop must change something that eventually makes its condition false — otherwise it runs forever.',
      ),
      ar: md(
        '**الحلقة** تكرّر كتلة من الكود. نستخدم `for` عندما نعرف عدد مرات التكرار، ونستخدم `while` عندما نكرّر حتى يصبح الشرط خاطئًا.',
        '',
        '```python',
        'for i in range(3):',
        '    print(i)        # 0, 1, 2',
        '',
        'count = 3',
        'while count > 0:',
        '    print(count)',
        '    count -= 1',
        '```',
        '',
        'تتوقف `range(start, stop, step)` **قبل** قيمة `stop`: فالعبارة `range(1, 10, 3)` تعطي 1 ثم 4 ثم 7.',
        '',
        'تُنهي `break` الحلقة فورًا، وتنتقل `continue` إلى الدورة التالية.',
        '',
        'يجب أن تغيّر كل حلقة `while` شيئًا يجعل شرطها خاطئًا في النهاية، وإلا استمرت إلى ما لا نهاية.',
      ),
    },
    examples: [
      {
        title: ['Sum of 1 to n', 'مجموع الأعداد من 1 إلى n'],
        description: ['Collect a running total.', 'جمع تراكمي للقيم.'],
        code: py`n = 5
total = 0
for i in range(1, n + 1):
    total += i
print(total)`,
        output: '15',
        explanation: [
          'total starts at 0 and collects i on each round. range(1, n + 1) includes n because the stop value is excluded.',
          'يبدأ total من 0 ويجمع قيمة i في كل دورة. وتشمل range(1, n + 1) العدد n لأن قيمة النهاية مستبعدة.',
        ],
      },
      {
        title: ['Countdown with while', 'عدّ تنازلي باستخدام while'],
        description: ['Repeat until a condition is false.', 'التكرار حتى يصبح الشرط خاطئًا.'],
        code: py`count = 3
while count > 0:
    print(count)
    count -= 1
print("Go!")`,
        output: '3\n2\n1\nGo!',
        explanation: [
          'count -= 1 moves the loop toward its end. When count reaches 0 the condition is false and the loop stops.',
          'العبارة count -= 1 تقرّب الحلقة من نهايتها. وعندما يصل count إلى 0 يصبح الشرط خاطئًا وتتوقف الحلقة.',
        ],
      },
    ],
    worked: {
      title: ['Sum of digits', 'مجموع أرقام العدد'],
      statement: [
        'Read a positive integer n and print the sum of its digits. For 4096 the answer is 19.',
        'اقرأ عددًا صحيحًا موجبًا n ثم اطبع مجموع أرقامه. للعدد 4096 يكون الناتج 19.',
      ],
      approach: [
        'The last digit of n is n % 10. Add it to a total, then remove it with n // 10. Repeat while n is greater than 0.',
        'آخر رقم في n هو n % 10. أضفه إلى مجموع ثم احذفه بالعملية n // 10. كرّر ذلك ما دام n أكبر من 0.',
      ],
      solution: py`n = int(input())
total = 0
while n > 0:
    total += n % 10
    n //= 10
print(total)`,
      solutionExplanation: [
        'For 4096: add 6 (n becomes 409), add 9 (n becomes 40), add 0 (n becomes 4), add 4 (n becomes 0). The total is 19.',
        'للعدد 4096: نضيف 6 ويصبح n = 409، ثم نضيف 9 ويصبح n = 40، ثم نضيف 0 ويصبح n = 4، ثم نضيف 4 ويصبح n = 0. المجموع 19.',
      ],
      complexity: 'O(d), d = number of digits',
      difficulty: 'Medium',
    },
    problems: [
      [282, 'A', 'Bit++', 800, ['implementation']],
      [791, 'A', 'Bear and Big Brother', 800, ['implementation']],
      [266, 'A', 'Stones on the Table', 800, ['implementation']],
    ],
    quiz: [
      {
        text: [
          'Which loop is commonly used when the number of iterations is known?',
          'أي حلقة تُستخدم عادةً عندما يكون عدد مرات التكرار معروفًا؟',
        ],
        options: ['for', 'if', 'def', 'print'],
        correct: 0,
        explanation: [
          'A for loop over range(n) repeats exactly n times.',
          'تكرّر حلقة for على range(n) بالضبط n مرة.',
        ],
      },
      {
        text: ['Which values are printed?', 'ما القيم التي تُطبع؟'],
        code: py`for i in range(3):
    print(i)`,
        options: ['0, 1, 2', '1, 2, 3', '0, 1, 2, 3', '1, 2'],
        correct: 0,
        explanation: [
          'range(3) starts at 0 and stops before 3.',
          'تبدأ range(3) من 0 وتتوقف قبل 3.',
        ],
      },
      {
        text: ['Which values does range(1, 10, 3) produce?', 'ما القيم التي تنتجها range(1, 10, 3) ؟'],
        options: ['1, 4, 7', '1, 4, 7, 10', '3, 6, 9', '1, 3, 5, 7, 9'],
        correct: 0,
        explanation: [
          'Start at 1, add 3 each time, and stop before 10: 1, 4, 7. The next value, 10, is excluded.',
          'نبدأ من 1 ونضيف 3 كل مرة ونتوقف قبل 10: أي 1 ثم 4 ثم 7. والقيمة التالية 10 مستبعدة.',
        ],
      },
      {
        text: ['What does break do inside a loop?', 'ماذا تفعل break داخل الحلقة؟'],
        options: [
          ['Exits the loop immediately', 'تُنهي الحلقة فورًا'],
          ['Skips to the next round', 'تنتقل إلى الدورة التالية'],
          ['Stops the whole program', 'توقف البرنامج كله'],
          ['Restarts the loop', 'تعيد بدء الحلقة'],
        ],
        correct: 0,
        explanation: [
          'break leaves the nearest loop. continue is the one that skips to the next round.',
          'تُنهي break أقرب حلقة، أما التي تنتقل إلى الدورة التالية فهي continue.',
        ],
      },
      {
        text: ['What happens when this code runs?', 'ماذا يحدث عند تشغيل هذا الكود؟'],
        code: py`i = 0
while i < 3:
    print(i)`,
        options: [
          ['It prints 0 forever', 'يطبع 0 إلى ما لا نهاية'],
          ['It prints 0, 1, 2', 'يطبع 0 ثم 1 ثم 2'],
          ['It prints 0 once', 'يطبع 0 مرة واحدة'],
          ['A syntax error', 'خطأ في الصياغة'],
        ],
        correct: 0,
        explanation: [
          'i never changes, so i < 3 stays true. Add i += 1 inside the loop to fix it.',
          'قيمة i لا تتغير فيبقى الشرط i < 3 صحيحًا. أضف i += 1 داخل الحلقة لإصلاح ذلك.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه الأسطر؟'],
        code: py`total = 0
for i in range(1, 5):
    total += i
print(total)`,
        options: ['10', '15', '4', '5'],
        correct: 0,
        explanation: [
          'i takes the values 1, 2, 3, 4, and 1 + 2 + 3 + 4 = 10.',
          'تأخذ i القيم 1 و2 و3 و4، ومجموعها 10.',
        ],
      },
    ],
  },

  /* ───────────── 6. Lists ───────────── */
  {
    id: 6,
    title: ['Lists', 'القوائم'],
    summary: [
      'Store many values in one list and work with them.',
      'خزّن عدة قيم في قائمة واحدة وتعامل معها.',
    ],
    minutes: 45,
    prerequisites: [5],
    lessonTitle: ['Working with lists', 'التعامل مع القوائم'],
    lessonBody: {
      en: md(
        'A **list** keeps many values in order. Items are numbered from **0**, and negative numbers count from the end:',
        '',
        '```python',
        'nums = [10, 20, 30, 40]',
        'print(nums[0])     # 10',
        'print(nums[-1])    # 40',
        'nums.append(50)    # add at the end',
        'print(len(nums))   # 5',
        '```',
        '',
        'A slice `nums[1:3]` takes the items from index 1 up to (but not including) index 3. Loop over a list with `for x in nums:`.',
        '',
        'Handy functions: `len`, `sum`, `min`, `max`, `sorted`. Asking for an index that does not exist raises `IndexError`.',
      ),
      ar: md(
        '**القائمة** تحتفظ بعدة قيم مرتبة. تُرقَّم العناصر بدءًا من **0**، وتعدّ الأرقام السالبة من النهاية:',
        '',
        '```python',
        'nums = [10, 20, 30, 40]',
        'print(nums[0])     # 10',
        'print(nums[-1])    # 40',
        'nums.append(50)    # add at the end',
        'print(len(nums))   # 5',
        '```',
        '',
        'تأخذ الشريحة `nums[1:3]` العناصر من الفهرس 1 حتى الفهرس 3 دون أن تشمله. ونمرّ على عناصر القائمة بالعبارة `for x in nums:`.',
        '',
        'دوال مفيدة: `len` و`sum` و`min` و`max` و`sorted`. وطلب فهرس غير موجود يسبب الخطأ `IndexError`.',
      ),
    },
    examples: [
      {
        title: ['Basic list operations', 'العمليات الأساسية على القوائم'],
        description: ['Append, slice, len and sum.', 'استخدام append والشرائح وlen وsum.'],
        code: py`nums = [10, 20, 30, 40]
nums.append(50)
print(nums[1:4])
print(len(nums), sum(nums))`,
        output: '[20, 30, 40]\n5 150',
        explanation: [
          'The slice nums[1:4] holds indexes 1, 2 and 3. After append the list has 5 items and their sum is 150.',
          'تضم الشريحة nums[1:4] العناصر ذات الفهارس 1 و2 و3. وبعد append يصبح في القائمة 5 عناصر ومجموعها 150.',
        ],
      },
      {
        title: ['Find the maximum manually', 'إيجاد أكبر عنصر يدويًا'],
        description: ['Loop and remember the best value.', 'المرور على القائمة وتذكّر أفضل قيمة.'],
        code: py`nums = [4, 9, 2, 7]
best = nums[0]
for x in nums:
    if x > best:
        best = x
print(best)`,
        output: '9',
        explanation: [
          'best remembers the largest value seen so far and is updated whenever a bigger value appears.',
          'يحتفظ best بأكبر قيمة ظهرت حتى الآن ويتحدّث كلما ظهرت قيمة أكبر.',
        ],
      },
    ],
    worked: {
      title: ['Count values above the average', 'عدد القيم الأكبر من المتوسط'],
      statement: [
        'Given the list [4, 8, 6, 2, 10], print how many numbers are greater than the average of the list.',
        'بالنظر إلى القائمة [4, 8, 6, 2, 10] اطبع عدد الأعداد الأكبر من متوسط القائمة.',
      ],
      approach: [
        'First compute the average with sum(nums) / len(nums). Then loop over the list and count the items bigger than it.',
        'احسب المتوسط أولًا بالعملية sum(nums) / len(nums). ثم مرّ على القائمة وعُدّ العناصر الأكبر منه.',
      ],
      solution: py`nums = [4, 8, 6, 2, 10]
average = sum(nums) / len(nums)
count = 0
for x in nums:
    if x > average:
        count += 1
print(count)`,
      solutionExplanation: [
        'The average is 30 / 5 = 6.0. Only 8 and 10 are greater, so the answer is 2.',
        'المتوسط هو 30 / 5 = 6.0، والأكبر منه هما 8 و10 فقط، فيكون الناتج 2.',
      ],
      complexity: 'O(n)',
      difficulty: 'Medium',
    },
    problems: [
      [160, 'A', 'Twins', 900, ['greedy', 'sortings']],
      [144, 'A', 'Arrival of the General', 800, ['implementation']],
      [263, 'A', 'Beautiful Matrix', 800, ['implementation']],
    ],
    quiz: [
      {
        text: ['What does this print?', 'ماذا تطبع هذه الأسطر؟'],
        code: py`nums = [10, 20, 30]
print(nums[1])`,
        options: ['10', '20', '30', 'Error'],
        correct: 1,
        explanation: [
          'Indexes start at 0, so nums[1] is the second item: 20.',
          'تبدأ الفهارس من 0، فالعنصر nums[1] هو الثاني أي 20.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه الأسطر؟'],
        code: py`nums = [10, 20, 30]
print(nums[-1])`,
        options: ['10', '20', '30', 'Error'],
        correct: 2,
        explanation: [
          'A negative index counts from the end: -1 is the last item.',
          'الفهرس السالب يعدّ من النهاية، فالفهرس -1 هو العنصر الأخير.',
        ],
      },
      {
        text: ['Which method adds an item to the end of a list?', 'أي دالة تضيف عنصرًا إلى نهاية القائمة؟'],
        options: ['append()', 'add()', 'push()', 'join()'],
        correct: 0,
        explanation: [
          'append() is the list method that adds one item at the end.',
          'الدالة append() تضيف عنصرًا واحدًا في نهاية القائمة.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print([1, 2, 3, 4, 5][1:4])',
        options: ['[1, 2, 3, 4]', '[2, 3, 4]', '[2, 3, 4, 5]', '[2, 3]'],
        correct: 1,
        explanation: [
          'The slice [1:4] takes indexes 1, 2 and 3, which hold 2, 3 and 4.',
          'تأخذ الشريحة [1:4] الفهارس 1 و2 و3 وقيمها 2 و3 و4.',
        ],
      },
      {
        text: ['What happens when this runs?', 'ماذا يحدث عند تشغيل هذه الأسطر؟'],
        code: py`a = [1, 2, 3]
print(a[3])`,
        options: [
          ['IndexError', 'يحدث الخطأ IndexError'],
          ['It prints 3', 'يطبع 3'],
          ['It prints None', 'يطبع None'],
          ['It prints [3]', 'يطبع [3]'],
        ],
        correct: 0,
        explanation: [
          'The valid indexes are 0, 1 and 2. Index 3 does not exist.',
          'الفهارس الصالحة هي 0 و1 و2 فقط، والفهرس 3 غير موجود.',
        ],
      },
    ],
  },

  /* ───────────── 7. Strings ───────────── */
  {
    id: 7,
    title: ['Strings', 'النصوص'],
    summary: ['Index, slice and transform text.', 'فهرسة النصوص وتقطيعها وتحويلها.'],
    minutes: 40,
    prerequisites: [5],
    lessonTitle: ['Working with text', 'التعامل مع النصوص'],
    lessonBody: {
      en: md(
        'A **string** is a sequence of characters. You can index and slice it like a list, but strings are **immutable**: you cannot change a character in place.',
        '',
        '```python',
        's = "BaccaCode"',
        'print(s[0])        # B',
        'print(s[0:5])      # Bacca',
        'print(s[::-1])     # edoCaccaB',
        'print(len(s))      # 9',
        '```',
        '',
        'Useful methods: `upper()`, `lower()`, `strip()`, `split(sep)`, `replace(a, b)` and `sep.join(items)`. Use `in` to test whether a piece of text appears inside another.',
        '',
        'Build text with an **f-string**: `f"Hello {name}"`.',
      ),
      ar: md(
        '**النص** تسلسل من الأحرف. يمكنك فهرسته وتقطيعه مثل القوائم، لكنه **غير قابل للتعديل**: لا يمكن تغيير حرف داخله مباشرةً.',
        '',
        '```python',
        's = "BaccaCode"',
        'print(s[0])        # B',
        'print(s[0:5])      # Bacca',
        'print(s[::-1])     # edoCaccaB',
        'print(len(s))      # 9',
        '```',
        '',
        'دوال مفيدة: `upper()` و`lower()` و`strip()` و`split(sep)` و`replace(a, b)` و`sep.join(items)`. ونستخدم `in` لمعرفة هل يظهر جزء من النص داخل نص آخر.',
        '',
        'ونبني النصوص باستخدام **f-string**: `f"Hello {name}"`.',
      ),
    },
    examples: [
      {
        title: ['Reverse and compare', 'العكس والمقارنة'],
        description: ['A word that equals its reverse.', 'كلمة تساوي مقلوبها.'],
        code: py`word = "level"
print(word[::-1])
print(word == word[::-1])`,
        output: 'level\nTrue',
        explanation: [
          '[::-1] walks the string backwards. A word that equals its reverse is a palindrome.',
          'تقرأ [::-1] النص من آخره إلى أوله. والكلمة التي تساوي مقلوبها تسمى متناظرة (palindrome).',
        ],
      },
      {
        title: ['Count vowels', 'عدّ الحروف المتحركة'],
        description: ['Loop over characters.', 'المرور على الأحرف واحدًا واحدًا.'],
        code: py`text = "BaccaCode"
count = 0
for ch in text.lower():
    if ch in "aeiou":
        count += 1
print(count)`,
        output: '4',
        explanation: [
          'lower() makes the check case-insensitive. The in operator tests whether the character is one of the vowels.',
          'تجعل lower() الفحص غير حساس لحالة الأحرف، ويختبر المعامل in هل الحرف من الحروف المتحركة.',
        ],
      },
    ],
    worked: {
      title: ['Palindrome check', 'فحص النص المتناظر'],
      statement: [
        'Read a word and print YES if it reads the same forwards and backwards, otherwise NO.',
        'اقرأ كلمة ثم اطبع YES إذا كانت تُقرأ بالطريقة نفسها من أولها إلى آخرها ومن آخرها إلى أولها، وإلا فاطبع NO.',
      ],
      approach: [
        'Build the reversed string with s[::-1] and compare it with the original using ==.',
        'كوّن النص المعكوس بالعبارة s[::-1] ثم قارنه بالأصل باستخدام ==.',
      ],
      solution: py`s = input().strip().lower()
if s == s[::-1]:
    print("YES")
else:
    print("NO")`,
      solutionExplanation: [
        'strip() removes accidental spaces and lower() ignores capital letters, so Level and level are treated the same.',
        'تزيل strip() الفراغات الزائدة وتتجاهل lower() الأحرف الكبيرة، فتُعامل Level وlevel بالطريقة نفسها.',
      ],
      complexity: 'O(n)',
      difficulty: 'Easy',
    },
    problems: [
      [71, 'A', 'Way Too Long Words', 800, ['strings']],
      [281, 'A', 'Word Capitalization', 800, ['implementation', 'strings']],
      [118, 'A', 'String Task', 1000, ['implementation', 'strings']],
    ],
    quiz: [
      {
        text: ['What does "python".upper() return?', 'ماذا تُرجع "python".upper() ؟'],
        options: ['"PYTHON"', '"Python"', '"python"', 'Error'],
        correct: 0,
        explanation: [
          'upper() returns a copy of the text in capital letters.',
          'تُرجع upper() نسخة من النص بالأحرف الكبيرة.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه الأسطر؟'],
        code: py`s = "BaccaCode"
print(s[0:5])`,
        options: ['Bacca', 'Bacc', 'BaccaC', 'accaC'],
        correct: 0,
        explanation: [
          'The slice [0:5] takes indexes 0 to 4: B, a, c, c, a.',
          'تأخذ الشريحة [0:5] الفهارس من 0 إلى 4: أي B وa وc وc وa.',
        ],
      },
      {
        text: ['What happens when this runs?', 'ماذا يحدث عند تشغيل هذه الأسطر؟'],
        code: py`s = "abc"
s[0] = "z"`,
        options: [
          ['TypeError: strings cannot be changed in place', 'خطأ TypeError: لا يمكن تعديل النص مباشرةً'],
          ['s becomes "zbc"', 'يصبح s مساويًا "zbc"'],
          ['s becomes "zabc"', 'يصبح s مساويًا "zabc"'],
          ['Nothing happens', 'لا يحدث شيء'],
        ],
        correct: 0,
        explanation: [
          'Strings are immutable. To change one, build a new string: s = "z" + s[1:].',
          'النصوص غير قابلة للتعديل. ولتغيير نص ننشئ نصًا جديدًا: s = "z" + s[1:].',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print("a,b,c".split(","))',
        options: ["['a', 'b', 'c']", 'a b c', "['a,b,c']", '3'],
        correct: 0,
        explanation: [
          'split(",") cuts the text at every comma and returns a list of the pieces.',
          'تقطع split(",") النص عند كل فاصلة وتُرجع قائمة بالأجزاء.',
        ],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه العبارة؟'],
        code: 'print("hello"[::-1])',
        options: ['olleh', 'hello', 'h', 'Error'],
        correct: 0,
        explanation: [
          'A step of -1 reads the text backwards.',
          'الخطوة -1 تقرأ النص من آخره إلى أوله.',
        ],
      },
    ],
  },

  /* ───────────── 8. Functions ───────────── */
  {
    id: 8,
    title: ['Functions', 'الدوال'],
    summary: [
      'Package code in reusable functions with def and return.',
      'غلّف الكود في دوال قابلة لإعادة الاستخدام باستخدام def وreturn.',
    ],
    minutes: 50,
    prerequisites: [5],
    lessonTitle: ['Defining functions', 'تعريف الدوال'],
    lessonBody: {
      en: md(
        'A **function** is a named block of code you can call again and again. Define it with `def`, give it **parameters**, and send a result back with `return`:',
        '',
        '```python',
        'def square(x):',
        '    return x * x',
        '',
        'print(square(4))   # 16',
        '```',
        '',
        '`return` sends a value back to the caller. `print` only shows text on the screen — a function that only prints returns `None`. A parameter can have a **default** value: `def greet(name="friend")`.',
        '',
        'Variables created inside a function are **local**: they do not exist outside it.',
      ),
      ar: md(
        '**الدالة** كتلة من الكود لها اسم، ويمكنك استدعاؤها مرارًا. نعرّفها بـ `def` ونعطيها **معاملات**، ونُرجع النتيجة بـ `return`:',
        '',
        '```python',
        'def square(x):',
        '    return x * x',
        '',
        'print(square(4))   # 16',
        '```',
        '',
        'تُرجع `return` قيمة إلى من استدعى الدالة، أما `print` فتعرض نصًا على الشاشة فقط، والدالة التي تطبع فقط تُرجع `None`. ويمكن أن يكون للمعامل قيمة **افتراضية**: `def greet(name="friend")`.',
        '',
        'المتغيرات التي تُنشأ داخل الدالة **محلية**: لا وجود لها خارجها.',
      ),
    },
    examples: [
      {
        title: ['A function that returns a value', 'دالة تُرجع قيمة'],
        description: ['Use a call inside an expression.', 'استخدام الاستدعاء داخل تعبير.'],
        code: py`def square(x):
    return x * x

print(square(4))
print(square(5) + 1)`,
        output: '16\n26',
        explanation: [
          'The call square(5) becomes the value 25, so it can be used inside a bigger expression.',
          'يتحوّل الاستدعاء square(5) إلى القيمة 25 فيمكن استخدامه داخل تعبير أكبر.',
        ],
      },
      {
        title: ['Default parameter', 'معامل بقيمة افتراضية'],
        description: ['Call with and without an argument.', 'الاستدعاء مع قيمة وبدونها.'],
        code: py`def greet(name="friend"):
    print("Hello,", name)

greet()
greet("Sara")`,
        output: 'Hello, friend\nHello, Sara',
        explanation: [
          'When no argument is given, name uses its default value.',
          'عند عدم تمرير قيمة يستخدم name قيمته الافتراضية.',
        ],
      },
    ],
    worked: {
      title: ['Is it prime?', 'هل العدد أولي؟'],
      statement: [
        'Write a function is_prime(n) that returns True if n is prime. Then print the prime numbers from 1 to 20.',
        'اكتب دالة is_prime(n) تُرجع True إذا كان n عددًا أوليًا. ثم اطبع الأعداد الأولية من 1 إلى 20.',
      ],
      approach: [
        'A prime has no divisor between 2 and its square root. Return False as soon as a divisor is found, and True if the loop ends without finding one. Numbers below 2 are not prime.',
        'العدد الأولي ليس له قاسم بين 2 وجذره التربيعي. أرجِع False بمجرد العثور على قاسم، وأرجِع True إذا انتهت الحلقة دون العثور على قاسم. والأعداد الأصغر من 2 ليست أولية.',
      ],
      solution: py`def is_prime(n):
    if n < 2:
        return False
    d = 2
    while d * d <= n:
        if n % d == 0:
            return False
        d += 1
    return True

for k in range(1, 21):
    if is_prime(k):
        print(k, end=" ")`,
      solutionExplanation: [
        'return ends the function immediately, so the first divisor found is enough. The loop only checks while d * d <= n.',
        'تُنهي return الدالة فورًا، فيكفي العثور على أول قاسم. وتفحص الحلقة القيم ما دام d * d <= n.',
      ],
      complexity: 'O(√n)',
      difficulty: 'Hard',
    },
    problems: [
      [1328, 'A', 'Divisibility Problem', 800, ['math']],
      [1335, 'A', 'Candies and Two Sisters', 800, ['math']],
      [1360, 'A', 'Minimal Square', 800, ['geometry', 'math']],
    ],
    quiz: [
      {
        text: ['Which keyword defines a function?', 'أي كلمة محجوزة تُستخدم لتعريف دالة؟'],
        options: ['def', 'func', 'function', 'fun'],
        correct: 0,
        explanation: ['Python uses def.', 'تستخدم بايثون الكلمة def.'],
      },
      {
        text: ['What does this print?', 'ماذا تطبع هذه الأسطر؟'],
        code: py`def f(x):
    return x * 2

print(f(4))`,
        options: ['8', '4', 'None', '24'],
        correct: 0,
        explanation: [
          'f(4) returns 4 * 2 = 8, and print shows it.',
          'تُرجع f(4) القيمة 4 * 2 = 8 ثم تعرضها print.',
        ],
      },
      {
        text: ['After y = g(3), what is the value of y?', 'بعد تنفيذ y = g(3) ما قيمة y ؟'],
        code: py`def g(x):
    print(x * 2)

y = g(3)`,
        options: ['None', '6', '3', 'Error'],
        correct: 0,
        explanation: [
          'g prints 6 but has no return statement, so it returns None.',
          'تطبع g القيمة 6 لكن ليس فيها return، فتُرجع None.',
        ],
      },
      {
        text: [
          'What is the main difference between return and print?',
          'ما الفرق الرئيسي بين return وprint ؟',
        ],
        options: [
          ['return gives a value back to the caller; print only shows text', 'return تُرجع قيمة لمن استدعى الدالة، أما print فتعرض نصًا فقط'],
          ['They are identical', 'لا فرق بينهما'],
          ['print gives a value back; return only shows text', 'print تُرجع قيمة، أما return فتعرض نصًا فقط'],
          ['return only works with numbers', 'return تعمل مع الأعداد فقط'],
        ],
        correct: 0,
        explanation: [
          'A returned value can be stored and reused. A printed value is only displayed.',
          'القيمة المُرجَعة يمكن تخزينها وإعادة استخدامها، أما المطبوعة فتُعرض فقط.',
        ],
      },
      {
        text: ['What is printed?', 'ماذا يُطبع؟'],
        code: py`def greet(name="friend"):
    print("Hello,", name)

greet()`,
        options: ['Hello, friend', 'Hello, name', 'Error: missing argument', 'Hello,'],
        correct: 0,
        explanation: [
          'No argument was passed, so name takes its default value "friend".',
          'لم تُمرَّر قيمة، فيأخذ name قيمته الافتراضية "friend".',
        ],
      },
    ],
  },
];
