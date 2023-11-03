
.. _appendum:

Appendum: A Short History of Web Development
============================================

*Let's talk about fullstack web development!*

(and why in 2023 it (still) sucks)

Prehistory
----------

Let's look back in history.

The web-browser was born in the nineties.  It introduced the "hyperlink" that takes you from
one *static* webpage to another.  And, indeed, that - and just that - was the whole purpose of the web-browser
at that time: *take you from one static page to another.*

You can think it as the windows file browser (where you navigate in a directory tree looking for files) or
similar desktop apps in linux (dolphin and whatnot).  It's the same idea - but for the internet.

And as you can see, a file browser simply jumping from one page/file to another, is not a great "paradigm" 
for general-purpose, interactive GUI (graphical user interface) framework.

On the other hand, during the nineties (1995), Qt also became available - with the exception that it *was* designed 
from the very beginning for GUI applications.  And it wasn't of course the first of such frameworks.

So to recap, html evolved incrementally from a "file browser" into a GUI framework, 
carrying along all the extra baggage of the wrong paradigm with it.

In order to unwind the messy history of web app development, we need some clear definitions.

Definitions
-----------

A. The Client: your web-browser doing HTTP get, post, etc. calls
B. The Backend: server responding to client's HTTP calls
C. The View: The GUI with all it's graphical elements, buttons, etc.
D. The Data: data that is placed/cached into the view
E. View action: actions that take place in the browser GUI view (C) 
   resulting from user's clicks and interaction with the view, for example:

   - Expand available menus
   - Expand or collapse a tree structure

F. Data action: the action of updating the view (C) with data (D)

   - The GUI is refreshed with new data
   - NOTE: Data is cached into the GUI (C) (say, record values, numerical data, etc.)

Bronze Age
----------

In the beginning, each and every (E) resulted in the intercommunication
between (A) and (B) and the whole view (C), i.e. a new html file, was sent back to (A).

So it was like *reactive-static* html if you had to pick it a funky name for that.  And it is still
in active use today.

HTML templating systems with inheritance etc. stuff are used in order to serve all those (slightly) different versions of the web-page, 
corresponding to different (E) view actions the user might do.

So, instead of just sending the data (D), *both* the view (C) *and* the data (D) were constantly
send again- and again from (B) to (A).  And it didn't exactly help that the language *par excellence* for doing 
all that serving and templating was php..!

Then, gradually, more and more javascript slowly started to creep into this "*reactive-static*"" php mess.

The motivation was clear: make web-pages more reactive, i.e. on one hand, add animations, toast messages and all that frill,
and on the other hand, let the user do view actions (E) without the need to always request the view (C)
(or parts of it) from the server (B).

The latter is a good idea if you get rid of sending the view *completely*: i.e. no more html coming from the server
(B) ever again when doing (E).  But there was an epoch in history, when both javascript *and* html of the view (C) were sent from (B) to (A).
We could call this one *reactive-static-reactive-js* mess.

Then there's also the variation, where you can either send the data (D) already "written into" the incoming html (C) from the server, 
or you can send the desired view (C) and data 
(D) separately and let the (A) client javascript (that probably came with the (C)) to populate the received html code with the data.

Ah - so many possibilities to create an impenetrable mess.

We still remember all those broken budget and travel expense apps that were constantly
doing weird shit and which we were forced to use as the end of the nineties was approaching.

This was a time of elegant point & click GUI interface adventure games that worked very-well
(monkey island and the like).  It was also the golden age of shitty and broken web apps.  And this was, of course, because
html was never designed for something like that (as I just discussed above).


Iron Age
--------

And now we have the modern web-frontend frameworks.

First the good news: there's no more funneling of html/the view (C) from (B) to (A) each time you
click something and do a view action (E).

The view (C) runs as an independent javascript code of intercommunicating graphical elements 
inside the browser, so this starts to look like Qt!

You can expand your tree structures, click'n'hide data elements, jump in the menus and there's
no resending the view from the server (B).

When data is requested, *just the data* flows from (B) to (A) (typically as a json), finally
populating the graphical elements (text etc. fields) in the view (C).  Yeah - this is the way you would
do it in Qt as well.

Finally we have a clean separation of the view (C) and the data (D)!

But the good news end here.  

Modern javascript frameworks use several layers of templating which have to be "transpiled" into actual
html and javascript, so you end up writing some weirdo templating language instead of html or javascript 
(how many god'd*** languages we need to master!?).

Here is an example of the popular Vue.js framework:

::

    <template>
    <v-app>
        <v-app-bar
        app
        color="primary"
        dense
        elevation="4"
        flat
        >
        <div class="d-flex align-center">
            <v-img
            alt="MyApp"
            class="shrink mr-2"
            contain
            src="@/assets/logo.png"
            transition="scale-transition"
            width="24"
            />

            <h3 v-if="releaseTag">MyApp ({{ releaseTag }})</h3>
            <h3 v-else>MyApp</h3>
        </div>

        <v-spacer />

I mean, what does that even mean!?  A programming language should be obvious to interprete.  And we are trying to do programming here, right?

It's basically a combination of a html-like (templating) language (vuetify in this case)
that describes a graphical view but with conditional programming clauses mixed within the
view definition (!)

Variables are inserted into this mongrel using double parenthesis ``{{``.

It's not a "markup" language describing (only) a graphical view, 
neither is it a proper programming language.  Surely it's not object-oriented or functional programming language.
It doesn't even come close to Pascal.  I surely wonder if *this* thing is "turing-complete".

At least I know for sure it is not a program that you could run directly, but it has to go through several layers of compilation (aka "transpiling").

Here is some more:

::

    <v-btn
        plain
        @click="onChangeFlag"
        class="align-self-center"
    >
    {{ $flag }}

So when clicking a button, something is executed in the js part.
Then that part changes a variable.  Then that variable is substituted
to ``flag``.  I mean, come on.

So it is things going to-and-fro between
an annoying templating/transpilable language and javascript.  Talk about
possibilities for major confusions here.

When did such crazy stuff start to feel normal and natural?

And there are so many examples I could give here about these nutty, fragile and unnatural frontend frameworks, but I will stop here as I don't want
to waste my time with them even the slightest.

And lucky you, having found CuteFront, the minimalistic pure-javascript framework!




