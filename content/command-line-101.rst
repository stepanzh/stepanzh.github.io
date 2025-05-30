Командная оболочка 101
######################

:date: 2025-01-28
:modified: 2025-05-14
:slug: command-line-101
:summary: Заметка для тех, кто работает в терминале и хочет лучше его понять. Речь пойдёт об аргументах, потоках и переменных окружения.
:description: Заметка для тех, кто работает в терминале и хочет лучше его понять. Речь пойдёт об аргументах, потоках и переменных окружения.
:keywords: консоль, терминал, аргумент, поток, переменная окружения, unix, command line, terminal, console, код выхода, интерполяция, цветной вывод, ansi escape code

.. role:: kbd

.. 
   TODO: kbd role

.. epigraph::

  Что происходит под капотом при работе в командной строке?
  Заметка для тех, кто работает в терминале и хочет лучше его понять.
  Речь пойдёт об аргументах, потоках и переменных окружения.

Проще всего начать с примера. Представьте, что вы открыли терминал,
ввели

.. code-block:: shell

   ls -alt Downloads

и нажали :kbd:`Enter`.
После этого на экране терминала появляется содержимое директории Downloads.
Под капотом отработали терминал, командная оболочка, операционная система и непосредственно программа ls.

Что произошло?
Много работы сделала оболочка.
После нажатия Enter она получила от терминала строку (команду) :code:`ls -alt Downloads` на обработку.
Сначала оболочка разбила её на массив строк: "ls", "-alt", "Downloads".
Первый элемент массива это название программы, оболочка ушла искать ls среди сотен других.
Затем оболочка вызвала ls и передала ей *массив аргументов* ("-alt", "Downloads"), а также *стандартный поток вывода* stdout.
Далее программа ls прочла переданный ей массив аргументов, отработала в соответствии с ним, и напечатала результат работы в stdout.
А теперь перейдём к скрытым деталям...

Аргументы программы в консольном мире
=====================================

Начнём с программы ls.
С её точки зрения аргументы это массив строк (см. `int argc, char* argv[] <https://en.cppreference.com/w/c/language/main_function>`_).
Чтобы интерфейс для разных программ был более-менее одинаков, в консольном мире действует множество соглашений.

Соглашение первое.
Аргументы бывают *ключевыми* и *позиционными*.
Ключевые аргументы начинаются с черты ("-alt"), и обычно могут передаваться в любом порядке.
Остальные аргументы — позиционные ("Downloads"), и обычно ставятся после ключевых.
Заметьте, что в Python (и многих других языках программирования) всё наоборот: сначала позиционные, затем по ключу!

Создатели ls следуют ещё одному соглашению — можно объединять ключевые аргументы в один, т.е. :code:`-alt` для программы ls это то же, что и три аргумента: :code:`-a -l -t`.
Все эти три аргумента работают как флаги, переключатели: "-a" показывает (скрытые) файлы, "-l" включает техническую сводку о каждом файле, а "-t" сортирует файлы по моменту изменения.

А что если аргумент по ключу требует значения?
Значение пишется через пробел или знак равенства после ключа, например, :code:`ls --color=never`.
В этом примере есть ещё одно соглашение: у ключей бывает два имени — короткое и полное (:code:`python -h` и :code:`python --help`).


Потоки
======

На самом деле, оболочка передаёт не один, а сразу три потока программе.
Потоки нужны для ввода и вывода информации, это своего рода каналы общения с программой, которые можно переключать.

*Поток вывода stdout* используется для вывода программой результата.
Именно сюда по умолчанию пишут функции вроде :code:`print`.

*Поток ошибок stderr* используется для вывода служебных, информирующих сообщений.
На практике, сюда пишутся логи и отладочная информация.

Наконец, *поток ввода stdin* передаётся оболочкой для чтения данных программой.
Именно этот поток читается функциями вроде :code:`input`, :code:`readline` или :code:`getchar`.

При программировании работа c потоками обычно доступна в стандартной библиотеке, например, в Python см. модуль `sys <https://docs.python.org/3/library/sys.html>`_.

А что ж такое поток?
--------------------

Поток это последовательность байт.
(Да, абстрактней остались только байт и бит.)
Поток можно читать, и можно в него писать.
Вопрос в том, как его интерпретировать.
При работе в консоли, всё, что вываливается на экран, интерпретируется как текст.
Но ничто не мешает вывалить на экран терминала картинку (:code:`cat wallpaper.png`).

Поток это абстракция, которая унифицирует интерфейс чтения и записи куда-либо, вообще.
Используя её, мы можем одинаково работать с выводом в терминал, файл или сетевой сокет.
Под капотом операционная система выделяет буферную память под поток, и мы работаем с этой памятью.
Содержимое буфера существует само по себе до момента "смытия" (flush).
В этот момент, то, что было в буфере, отправляется далее, например, в терминал, файл или сокет.

Используйте потоки в своих программах, особенно при создании библиотек.
Лучше, когда ваши функции пишут в потоки, а не в файлы или на экран.
Такой код гибче и его легче тестировать.
Например, вместо того, чтобы создавать и писать в файл, можно писать в текстовый поток, а потом сравнить его содержимое с эталонной строкой.

Перенаправление потоков
-----------------------

Вернёмся к потокам std.
Киллер-фича консольного мира — перенаправление потоков.
С помощью :code:`1>` вы можете перенаправить стандартный поток вывода в файл.

.. code-block:: shell

  ls -alt Downloads 1> file-list.txt

Аналогично с потоком ошибок, но используется «кран» :code:`2>`.
Вы можете направлять потоки вывода и ошибок в разные файлы, а можете в один, «краном» :code:`>`.

А чтобы сменить поток ввода, используется :code:`<`.
Например, в команде

.. code-block:: shell

  ls < my-list.txt

программа ls будет читать список директорий из файла my-list.txt.
Помните задания по информатике, где нужно было читать ввод с клавиатуры?
Так вот, у проверяющего скрипта никакой клавиатуры нет, вместо неё он подаёт на stdin вашей программы файл с входными данными, обёрнутый в поток.

Консольные программы часто создаются так, что вывод одной программы можно соединить с вводом второй.
Для этого используется *конвейер* (pipe) :code:`|`.
Например,

.. code-block:: shell

  ls -1 Downloads | wc -l

выведет на экран количество файлов в директории Downloads.
В целом, консольный unix-мир состоит из маленьких утилит, хорошо делающих свои маленькие задачи, а конвейер позволяет собирать из утилит более сложные программы.
С принципом конвейера вы можете встретиться при обработке массива данных: достать, отфильтровать, отсортировать, применить функцию и отдать.

Переменные окружения
====================

.. code-block:: shell

  env | tail

  LANG=ru_RU.UTF-8
  SHELL=/bin/zsh
  TERM_PROGRAM=iTerm.app
  TERM=xterm-256color
  HOME=/Users/stepanzh
  USER=stepanzh
  ZSH=/Users/stepanzh/.oh-my-zsh
  PAGER=less
  LSCOLORS=Gxfxcxdxbxegedabagacad
  EDITOR=nvim

Кроме потоков и аргументов, оболочка передаёт программе *переменные окружения* (environment).
Чаще всего, они используются как набор настроек по умолчанию.
Их можно просмотреть командой env, и программно доступиться через :code:`getenv`, :code:`ENV`, :code:`os.environ` или что-то подобное.
Например, программа ls читает переменную :code:`LSCOLORS`, чтобы подкрасить типы файлов цветами (файл, директория, ссылка, исполняемый файл и т.п.).

Переменные окружения организованы в словарь ключ-значение.
Значения и ключи только строковые, а сам словарь глобальный, для всех программ.
Однако его можно менять на время команды или вовсе подавать пустой.

Пример про OpenBLAS и numpy
---------------------------

Пример посложнее.
Попробуйте запустить какую-нибудь долгую (хотя бы минута) программу с numpy двумя командами:

.. code-block:: shell
  
  python main.py

  OPENBLAS_NUM_THREADS=X python main.py

где X это число ядер вашего процессора.
Скорее всего, второй пример будет работать существенно быстрее.
Почему?

По умолчанию, `numpy <https://numpy.org/>`_ использует библиотеку `OpenBLAS <https://github.com/OpenMathLib/OpenBLAS>`_ для линейной алгебры.
А OpenBLAS использует столько потоков (threads), сколько указано в переменной окружения :code:`OPENBLAS_NUM_THREADS`.
Беда в том, что по умолчанию эта переменная не проставлена, и OpenBLAS использует все потоки, включая логические.
В нагруженном вычислениями коде это обычно нежелательно, и стоит использовать столько потоков, сколько ядер в процессоре.


Переменная PATH
---------------

Одна из важнейших переменных окружения называется PATH.
Она содержит список директорий, где оболочка ищет программы, например, ls.
Когда вы устанавливаете новую консольную программу, вы можете добавить путь до неё в PATH, чтобы вызывать программу по названию, а не полному пути.
Но ещё лучше создать ссылку в директории, которая уже есть в PATH.
В unix-ах есть стандартное место для таких случаев — :code:`/usr/local/bin`.

А что ещё?
==========

Код выхода
----------

Всякая программа имеет *код выхода* (exit code, код ошибки).
Он хранится в специальной переменной "?".

.. code-block:: shell

   echo $?

Код 0 (ноль) по соглашению показывает отсутствие ошибки.

При написании однострочников часто используется оператор :code:`&&`.

.. code-block:: shell

  ls Downloads && echo hello

Этот оператор проверяет код выхода, и, если код ошибочный, цепочка команд после оператора не выполняется.

Интерполяция переменных
-----------------------

При создании массива аргументов для программы, оболочка интерполирует значения переменных и даже результаты других команд.
Например, при вызове

.. code-block:: shell

  ls $dirout

оболочка подставит значение переменной :code:`dirout`.

Интерполирование опасно, когда переменные хранят значения с пробелами: так один аргумент может превратиться в несколько.
Для экранирования пробелов в переменных используются двойные кавычки, а одинарные отключают интерполирование.
Поэтому в консольном мире распространены имена файлов `без пробелов <{filename}/kebab-case.rst>`_.

Интерполяция alias
------------------
Многие unix-оболочки предоставляют механизм alias, который по сути является сокращением команд.
Например, объявив

.. code-block:: shell
   
  alias gst='git status'

Вы сможете по alias :code:`gst` вызывать команду :code:`git status`.
Я нахожу это очень удобным в ежедневной работе, хотя многие предпочитают использовать полноценные функции вместо alias-ов.
Да, современная оболочка имеет полноценный язык программирования.
Чтобы функции и alias-ы были доступны всегда, их сохраняют в стартап-файле оболочки.

Чаще всего я использую такие alias-ы

.. code-block:: shell

   alias gc='git commit'
   alias gd='git diff'
   alias gl='git pull'
   alias gp='git push'
   alias gst='git status'

   alias ..='cd ..'

   alias ll='ls -lh'

Alias-ы интерполируются, при наборе команды вы можете считать, что alias просто подставляется.

.. code-block:: shell

   gc -m 'feat: new article on command line basics'

Ещё я люблю пользоваться `gnuplot <http://www.gnuplot.info/>`_ для построения графиков.
Когда мне часто требуется построить результаты расчёта, я сохранию gnuplot-скрипт, который ожидает на вход файл с данными, а выдаёт pdf-ку.
Так, я использую alias :code:`plt`.

.. code-block:: shell

   alias plt='gnuplot -c'

   plt residual-norm.gnuplot benchmark-summary.tsv > /tmp/residual-norm.pdf
   open /tmp/residual-norm.pdf

С таким подходом я за дешёво контролирую что построить и куда положить картинку.
Например, в связке Python + `matplotlib <https://matplotlib.org/>`_ получилось бы куда больше бойлерплейта (и, вероятно, медленнее бы работало).

Бонус. Как вывод программы становится цветным? Оболочка и терминал.
===================================================================

За цветную печать на экран отвечают текстовые коды `ANSI escape sequences <https://en.wikipedia.org/wiki/ANSI_escape_code>`_.
Но прежде следует отличать командную оболочку от терминала.

Оболочка это *софт*, который даёт доступ к работе с программами на компьютере из терминала.
Оболочка определяет, где ищутся программы, как интерполируются переменные, предоставляет скриптовый язык и, например, подсказывает ввод на :kbd:`Tab`.

А вот терминал это другое.
Терминал раньше — это *физическое устройство* ввода-вывода для компа размером с комнату.
Попросту говоря, это монитор и клавиатура, причём монитор мог поддерживать цвета.
Сейчас же терминал это программа, *эмулирующая* возможности тех, физических терминалов.
Физический современный терминал можно встретить в дата-центрах и серверных.

Вернёмся к ANSI кодам.
Это текстовые коды, которые интерпретируются терминалом (программой, а не оболочкой) как форматирующие: красящие, подчёркивающие, ожирняющие и т.п.
Когда терминал встречает форматирующий код, то он его не печатает, а лишь применяет форматирование ко всему последующему, например, пишет красным цветом.
Также есть код, который сбрасывает форматирование на обычное.
Подробней можно почитать тут `lihaoyi.com <https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html>`_.

Эмуляторов физических терминалов много, по умолчанию же используется  какой-нибудь популярный, вроде xterm-256color.

Самая широкая палитра ANSI кодов насчитывает 256 цветов, а также форматирующие модификаторы (жирность, подчёркнутость, фон и т.п.).
Кроме того, коды позволяют перемещать курсор не только в строке ввода, но и во всей области экрана, если эмулятор это поддерживает.
В таких терминалах можно создавать программы с текстовым интерфейсом, как в vim или Midnight Commander.
