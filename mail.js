
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function buildEmailHtml(subject, message) {

    const safeSubject =
        escapeHtml(
            subject.trim() ||
            "Thanks for reaching out to us!"
        );

    const safeMessage =
        escapeHtml(
            message.trim() ||
            "We've received your message."
        );

    const formattedMessage =
        safeMessage.replace(/\n/g, "<br>");

    return `<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeSubject}</title>
</head>

<body style="
margin:0;
padding:0;
background:
radial-gradient(circle at 20% 10%, #312060 0%, transparent 35%),
radial-gradient(circle at 85% 80%, #24164b 0%, transparent 35%),
#080510;
font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
color:#ffffff;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="
width:100%;
background:
radial-gradient(circle at 20% 10%, #312060 0%, transparent 35%),
radial-gradient(circle at 85% 80%, #24164b 0%, transparent 35%),
#080510;
"
>

<tr>
<td align="center" style="padding:50px 16px;">

<!-- MAIN GLASS CARD -->

<table
width="600"
cellpadding="0"
cellspacing="0"
style="
width:100%;
max-width:600px;
background:rgba(24,17,43,0.88);
border:1px solid rgba(255,255,255,0.10);
border-radius:24px;
overflow:hidden;
box-shadow:
0 25px 80px rgba(0,0,0,0.55),
0 0 50px rgba(124,58,237,0.12);
"
>

<!-- HEADER -->

<tr>
<td style="
padding:30px 34px;
background:
linear-gradient(
135deg,
rgba(124,58,237,0.28),
rgba(37,99,235,0.10)
);
border-bottom:1px solid rgba(255,255,255,0.08);
">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>

<td>

<div style="
font-size:25px;
font-weight:800;
letter-spacing:-0.8px;
">

<span style="
color:#A78BFA;
text-shadow:0 0 20px rgba(167,139,250,0.45);
">
Study
</span><span style="
color:#FFFFFF;
">
No.
</span>

</div>

<div style="
margin-top:6px;
font-size:11px;
font-weight:600;
letter-spacing:1.4px;
text-transform:uppercase;
color:#8f86a5;
">
Student-powered learning
</div>

</td>

<td align="right">

<div style="
display:inline-block;
padding:7px 11px;
border-radius:999px;
background:rgba(167,139,250,0.10);
border:1px solid rgba(167,139,250,0.18);
font-size:11px;
font-weight:600;
color:#BFAEFF;
">
StudyNo.
</div>

</td>

</tr>
</table>

</td>
</tr>


<!-- CONTENT -->

<tr>
<td style="
padding:42px 34px 36px;
">

<h1 style="
margin:0 0 22px;
font-size:25px;
line-height:1.3;
letter-spacing:-0.5px;
color:#FFFFFF;
font-weight:750;
">

${safeSubject}

</h1>


<div style="
width:42px;
height:3px;
margin-bottom:24px;
border-radius:10px;
background:linear-gradient(
90deg,
#A78BFA,
#6366F1
);
box-shadow:0 0 16px rgba(139,92,246,0.45);
">
</div>


<p style="
margin:0;
font-size:15px;
line-height:1.8;
color:#C8C1D6;
">

${formattedMessage}

</p>

</td>
</tr>


<!-- DIVIDER -->

<tr>
<td style="padding:0 34px;">

<div style="
height:1px;
background:linear-gradient(
90deg,
transparent,
rgba(255,255,255,0.12),
transparent
);
">
</div>

</td>
</tr>


<!-- SIGNATURE -->

<tr>
<td style="
padding:28px 34px 34px;
">

<p style="
margin:0;
font-size:14px;
line-height:1.7;
color:#81788F;
">

Kind regards,<br>

<strong style="
color:#D8D1E5;
font-weight:650;
">
The StudyNo. Team
</strong>

</p>

</td>
</tr>

</table>


<!-- FOOTER -->

<p style="
margin:24px 0 0;
font-size:11px;
line-height:1.6;
color:#71687F;
text-align:center;
">

StudyNo. · Built by students, for students

</p>

<p style="
margin:5px 0 0;
font-size:10px;
color:#4F475C;
text-align:center;
">
studyno.com
</p>


</td>
</tr>
</table>

</body>
</html>`;
}


// ================================
// GENERATE
// ================================

let currentHtml = "";

document
    .getElementById("generateBtn")
    .addEventListener("click", () => {

        const subject =
            document
                .getElementById("subject")
                .value;

        const message =
            document
                .getElementById("message")
                .value;

        currentHtml =
            buildEmailHtml(subject, message);

        document
            .getElementById("previewFrame")
            .srcdoc = currentHtml;

        document
            .getElementById("outputSection")
            .style.display = "block";

        document
            .getElementById("outputSection")
            .scrollIntoView({
                behavior: "smooth"
            });
    });


// ================================
// COPY HTML
// ================================

document
    .getElementById("copyHtmlBtn")
    .addEventListener("click", async () => {

        if (!currentHtml) return;

        await navigator.clipboard.writeText(
            currentHtml
        );

        showStatus(
            "HTML copied!"
        );
    });


// ================================
// OPEN MAIL
// ================================

document
    .getElementById("openMailBtn")
    .addEventListener("click", () => {

        const subject =
            document
                .getElementById("subject")
                .value
                .trim() ||
            "Thanks for reaching out to us!";

        const to =
            document
                .getElementById("recipient")
                .value
                .trim();

        const message =
            document
                .getElementById("message")
                .value
                .trim();

const plain =
`Thanks for reaching out to us!

We've received your message and appreciate you taking the time to write in.

${message}

Kind regards,
The StudyNo. Team`;

const mailto =
    `mailto:${encodeURIComponent(to)}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(plain)}`;

window.location.href = mailto;
});


// ================================
// STATUS
// ================================

function showStatus(message) {

    const status =
        document.getElementById("status");

    status.textContent = message;

    setTimeout(() => {
        status.textContent = "";
    }, 2500);
}