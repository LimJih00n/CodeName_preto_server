const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.post("/compile", (req, res) => {
    const { initcode, loopcode } = req.body;
    const filePath = path.join(__dirname, "./public/prito_main.py");

    fs.readFile(filePath, 'utf8', (readErr, data) => {
        if (readErr) {
            console.error(readErr);
            return res.status(500).send('Error reading game file.');
        }

        // 파일 내용을 마커에 따라 분할
        const initStartMarker = "#$user_init_start";
        const initEndMarker = "#$user_init_out";
        const loopStartMarker = "#$user_loop_start";
        const loopEndMarker = "#$user_loop_out";

        const beforeInitCode = data.substring(0, data.indexOf(initStartMarker) + initStartMarker.length);
        const afterInitCode = data.substring(data.indexOf(initEndMarker), data.indexOf(loopStartMarker) + loopStartMarker.length);
        const afterLoopCode = data.substring(data.indexOf(loopEndMarker));

        // 들여쓰기를 추가하여 코드 삽입 준비
        const indentedInitCode = initcode.split('\n').map(line => '    ' + line).join('\n');
        const indentedLoopCode = loopcode.split('\n').map(line => '    ' + line).join('\n');

        // 새로운 데이터 구성
        const newData = `${beforeInitCode}\n${indentedInitCode}\n${afterInitCode}\n${indentedLoopCode}\n${afterLoopCode}`;

        // 파일 쓰기
        fs.writeFile(filePath, newData, 'utf8', writeErr => {
            if (writeErr) {
                console.error(writeErr);
                return res.status(500).send('Error writing game file.');
            }
            console.log("Game script updated successfully.");
            
        });
    });
    res.send(`http://localhost:${PORT}/pyscript_html.html`);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
