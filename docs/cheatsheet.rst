 
Python vs JS Cheatsheet
=======================

Since the intended audience is for coders that have background in PyQt, this
python-compared-to-javascript cheatsheet might come handy.

else if
-------

.. code-block:: text

    if val == 0: # python
        pass
    elif val == 1:
        pass
    else
        pass

    if (val == 0) { // javascript
    }
    else if (val == 1) {
    }
    else {
    }

Type testing
------------

.. code-block:: text

    if isinstance(test, bool) // python
    if (typeof test === 'boolean') // javascript

Type conversions
----------------

*some of them*

.. code-block:: text

    st = str(i) // python
    let st = i.toString() // javascript

    i = int(st) // python
    let i = parseInt(st) // javascript

Strings
-------

*append*

.. code-block:: text

    st = st + 'more' # python
    st = st.concat('more') // javascript

*length*

.. code-block:: text

    len(st) # python
    st.length // javascript

*interpolation*

.. code-block:: text

    'kikkelis-kokkelis-{parameter}'.format(parameter=1) # python
    f'kikkelis-kokkelis-{parameter} # python
    `kikkelis-kokkelis-${parameter}" // javascript

*splitting*

.. code-block:: text

    str.split(",") // python AND javascript

*substring check*

.. code-block:: text

    substring in string # python
    string.includes(substring) // javascript

Lists, Arrays
-------------

*iteration*

.. code-block:: text

    for item in lis: # python
        <code>
    list.forEach(item => { // javascript
        <code> // NOTE: if you need early termination, don't use forEach
    })
    for (const item of lis) { // javascript
        <code>
    }
    for i, item in enumerate(lis): # python
        <code>
    for (var i = 0; i < list.length; i++) { // javascript
        var item = list[i]
        <code>
    }

*creation*

.. code-block:: text

    lis = [] # python
    lis.append(item)
    var lis = [] // javascript
    lis.push(item)

*modification*

.. code-block:: text

    lis.pop(index) # python
    lis.splice(index, 1) // javascript

*find index*

.. code-block:: text

    lis.index(element) # python
    lis.indexOf(element) // javascript


Sets
----

*from a list*

.. code-block:: text

    s = set(lis) # python
    s = Set(lis) // javascript

args
----

.. code-block:: text

    def func(*args): # python
        pass # args is a list
    function func(...args) { // javascript
        // args is an array
    }


Dictionaries, Objects
---------------------

*creating*

.. code-block:: text
    
    dic = {} # python
    dic = Objects() // javascript

*access per key*

.. code-block:: text

    dic[key] # python
    dic[key] // javascript

*get iterarable / list*

.. code-block:: text

    dic.keys() # python  iterable
    Object.keys(dic) // javascript list

*iteration*

.. code-block:: text

    for key, value in dic.items(): # python
        <code>
    for (const [key, value] of Object.entries(dict)) { // javascript
        <code>
    }
    Object.entries(dict).forEach( // javascript
        ([key, value]) => {
            <code>
        }
    )

*remove key-value*

.. code-block:: text

    dic.pop("key") # python
    dic.delete["key"] // javascript

*check for key*

.. code-block:: text

    'key-name' in dict # python
    dict.hasOwnProperty('key-name') // javascript


*catch unexisting key*

.. code-block:: text

    try: # python
        value = dict[key]
    except KeyError:
        <code>

    let value = dict[key] // javascript
    if (value == undefined) { <code> }

*from string*

.. code-block:: text

    dic = json.loads(st) # python
    let dic = JSON.parse(st) // javascript


Deepcopy
--------

.. code-block:: text

    a = copy.deepcopy(b) # python
    a = structuredClone(b) // javascript



Traceback
---------

.. code-block:: text

    import traceback # python
    traceback.print_stack()
    console.trace() // javascript


Subclassing
-----------

*call superclass ctor*

.. code-block:: text

    class ChildClass(ParentClass): # python
        def __init__(self):
            super()

    class ChildClass extends ParentClass { // javascript
        constructor() { super() } // javascript

*call superclass method*

.. code-block:: text

    class SubClass(BaseClass): # python
        ...
        def someMethod():
            super().someMethod()

    class SubClass extends BaseClass { // javascript
        ...
        someMethod() {
            super.someMethod(); // NOTE: no `()` in super
        }
    }


Object Instance Members
-----------------------

.. code-block:: text

    self.member = 1 # python
    this.member = 1 // javascript

See also :ref:`this <this_problem>` about this.


Lambda Functions
----------------

.. code-block:: text

    f = lambda x: x+1 # python
    (x) => { return x+1 } // javascript
    x => x+1 // javascript


JS Scope
--------

.. code-block:: text

    let x=1 // only withint current {} scope
    const x=1 // only withint current {} scope
    var x=1 // { var x=1 {seen also in this scope} }
