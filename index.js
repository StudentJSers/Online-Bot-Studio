let client = new Discord.Client()
let editor
let destroy
if (localStorage.getItem('token') == null) {
    localStorage.setItem('token', prompt('토큰을 입력해주세요!'))
}

let token = localStorage.getItem('token')

let compile = async value => {
    eval(`${value.replace(/<% token %>/gi, token)}\ndestroy = () => client.destroy()`)
}

let parseHTML = (html) => {
    let t = document.createElement('template')
    t.innerHTML = html;
    return t.content.cloneNode(true)
}

require.config({ paths: { 'vs': 'https://unpkg.com/monaco-editor@latest/min/vs' } })
window.MonacoEnvironment = { getWorkerUrl: () => proxy }

let proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor@latest/min/'
	}
	importScripts('https://unpkg.com/monaco-editor@latest/min/vs/base/worker/workerMain.js')
`], { type: 'text/javascript' }));

require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById('code'), {
        value: [
            `const client = new Discord.Client()`,
            '',
            `client.on('ready', () => {`,
            `\tconsole.log(\`Logged in as \${client.user.tag}!\`)`,
            `})`,
            `client.on('message', msg => {`,
            `\tif (msg.content === 'ping') {`,
            `\t\tmsg.reply('Pong!')`,
            `\t}`,
            `})`,
            '',
            `client.login('<% token %>')`
        ].join('\n'),
        language: 'javascript',
        theme: 'vs-dark',
        fontSize: 15
    })
})

window.addEventListener('load', () => {
    document.body.style.marginTop = `${document.getElementsByClassName('banner')[0].clientHeight}px`
    document.getElementById('run').disabled = false
    document.getElementById('stop').disabled = true
})
window.addEventListener('resize', () => {
    document.body.style.marginTop = `${document.getElementsByClassName('banner')[0].clientHeight}px`
})
document.getElementById('run').addEventListener('click', async e => {
    compile(editor.getValue())
    e.target.disabled = true
    document.getElementById('stop').disabled = false
})
document.getElementById('stop').addEventListener('click', async e => {
    destroy()
    e.target.disabled = true
    document.getElementById('run').disabled = false
})