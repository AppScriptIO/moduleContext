### TODO: 
- Consider using `new Map([iterable])` instead of array/object for storing cached referenced in `ModuleContextList` or `list` variables. 
- Use JS `Symbol()` for creating unique keys and storing the unique instances for debug purposes.
    ```
    let uniqueId = Symbol.for('referenceKey')
    console.log(uniqueId === Symbol.keyFor('referenceKey'))
    ```
    