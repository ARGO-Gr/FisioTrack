using Microsoft.Extensions.Options;
using FisioAppAPI.Models;

namespace FisioAppAPI.Services;

public interface IHtmlResponseService
{
    string GenerateSuccessHtml(string title, string message, string redirectUrl);
    string GenerateErrorHtml(string title, string message);
}

public class HtmlResponseService : IHtmlResponseService
{
    public string GenerateSuccessHtml(string title, string message, string redirectUrl)
    {
        return $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }}

        .container {{
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
            animation: slideIn 0.5s ease-out;
        }}

        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        .success-icon {{
            width: 80px;
            height: 80px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px;
            font-size: 40px;
            animation: scaleIn 0.5s ease-out 0.2s both;
        }}

        @keyframes scaleIn {{
            from {{
                transform: scale(0);
            }}
            to {{
                transform: scale(1);
            }}
        }}

        h1 {{
            color: #1f2937;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
        }}

        .subtitle {{
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.5;
        }}

        .message {{
            color: #374151;
            font-size: 15px;
            margin-bottom: 35px;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }}

        .redirect-info {{
            color: #9ca3af;
            font-size: 13px;
            margin-bottom: 25px;
        }}

        .btn {{
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }}

        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }}

        .btn:active {{
            transform: translateY(0);
        }}

        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='success-icon'>✓</div>
        <h1>{title}</h1>
        <p class='subtitle'>{message}</p>
        <p class='redirect-info'>Redirigiendo en <span id='countdown'>5</span> segundos...</p>
        <a href='{redirectUrl}' class='btn'>Ir a FisioApp</a>
        <div class='footer'>
            <p>Si no eres redirigido automáticamente, haz clic en el botón arriba.</p>
        </div>
    </div>

    <script>
        let countdown = 5;
        const countdownElement = document.getElementById('countdown');

        const interval = setInterval(() => {{
            countdown--;
            countdownElement.textContent = countdown;

            if (countdown === 0) {{
                clearInterval(interval);
                window.location.href = '{redirectUrl}';
            }}
        }}, 1000);

        // Allow clicking the button to redirect immediately
        document.querySelector('.btn').addEventListener('click', (e) => {{
            e.preventDefault();
            window.location.href = '{redirectUrl}';
        }});
    </script>
</body>
</html>";
    }

    public string GenerateErrorHtml(string title, string message)
    {
        return $@"
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{title}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }}

        .container {{
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 500px;
            width: 100%;
            padding: 40px;
            text-align: center;
            animation: slideIn 0.5s ease-out;
        }}

        @keyframes slideIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        .error-icon {{
            width: 80px;
            height: 80px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto 20px;
            font-size: 40px;
            animation: scaleIn 0.5s ease-out 0.2s both;
        }}

        @keyframes scaleIn {{
            from {{
                transform: scale(0);
            }}
            to {{
                transform: scale(1);
            }}
        }}

        h1 {{
            color: #1f2937;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
        }}

        .subtitle {{
            color: #6b7280;
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.5;
        }}

        .message {{
            color: #dc2626;
            font-size: 15px;
            margin-bottom: 30px;
            padding: 15px;
            background: #fee2e2;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }}

        .btn {{
            display: inline-block;
            padding: 12px 32px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
        }}

        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
        }}

        .btn:active {{
            transform: translateY(0);
        }}

        .footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #9ca3af;
            font-size: 12px;
        }}

        .help-text {{
            margin-top: 20px;
            color: #6b7280;
            font-size: 13px;
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='error-icon'>✕</div>
        <h1>{title}</h1>
        <p class='subtitle'>{message}</p>
        <div class='message'>
            <strong>Posibles razones:</strong><br/>
            • El enlace ha expirado<br/>
            • El token es inválido<br/>
            • El enlace ya fue utilizado
        </div>
        <a href='javascript:history.back()' class='btn'>Volver</a>
        <div class='help-text'>
            <p>Si el problema persiste, contacta al equipo de soporte.</p>
        </div>
    </div>
</body>
</html>";
    }
}
