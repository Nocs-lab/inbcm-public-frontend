from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
import os

load_dotenv()

site_public = os.getenv("site_public")
page_declaracao = os.getenv("page_declaracao")
user = os.getenv("user")
pwd = os.getenv("pwd")


def login_public(pagina, user, pwd):
    pagina.goto(site_public)
    pagina.fill('xpath=//*[@id="email"]', user)
    pagina.fill('xpath=//*[@id="password"]', pwd)
    pagina.click('xpath=//*[@id="root"]/div[2]/div[1]/form/button')
    if pagina.wait_for_selector('text="Minhas declarações"', timeout=5000):
        print("Login realizado com sucesso!")
    else:
        print("Erro no login.")


def test_nova_declaracao(pagina):
    pagina.goto(page_declaracao)
    if pagina.wait_for_selector('text=Nova declaração', timeout=5000):
        print("Página de Nova declaração: Acessível")
    else:
        print("Página de Nova declaração: Inacessível")

def test_envio_declaracao(pagina):
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button') 
    
    pagina.wait_for_selector('div.br-checkbox label:has-text("Museológico")', timeout=5000)
    pagina.click('div.br-checkbox label:has-text("Museológico")')
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button') 
    with pagina.expect_file_chooser() as fc:
        pagina.click('xpath=//*[@id="root"]/main/form/div[2]/div/button')
        file_chooser = fc.value
        file_chooser.set_files("./src/scripts/content/Museologico.xlsx")
    pagina.wait_for_selector('button.br-button.primary.mt-5', timeout=5000)
    pagina.click('button.br-button.primary.mt-5')
    pagina.click('button.br-button.primary.small.m-2')
    if pagina.wait_for_selector('text="Declaração enviada com sucesso!"', timeout=5000):
        print("Envio de declaração: Sucesso")
    else:
        print("Envio de declaração: Falhou")
    pagina.click('text= Exibir') 

def test_retificacao(pagina):
    pagina.click('text= Retificar')
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button')
    pagina.wait_for_selector('div.br-checkbox label:has-text("Museológico")', timeout=5000)
    pagina.click('div.br-checkbox label:has-text("Museológico")')
    pagina.click('xpath=//*[@id="root"]/main/form/div[1]/div[3]/div[1]/button')
    
    with pagina.expect_file_chooser() as fc:
        pagina.click('xpath=//*[@id="root"]/main/form/div[2]/div/button')
        file_chooser = fc.value
        file_chooser.set_files("./src/scripts/content/Museologico.xlsx")
    pagina.click('button.br-button.primary.mt-5')
    pagina.click("button.br-button.primary.small.m-2")
    if pagina.wait_for_selector('text=Declaração retificadora', timeout=5000):
        print("Declaração retificada: Sucesso")
    else:
        print("Declaração retificada: Falhou")


def test_exclusao_declaracao(pagina):
    pagina.click('text= Excluir')
    pagina.click('text=Confirmar')
    if pagina.wait_for_selector('text=Declaração excluída com sucesso!', timeout=5000):
        print("Exclusão de declaração: Sucesso\n")
        print("""# Fluxo principal de:\n
- Envio de declaração
- Retificação
- Exclusão
    OK""")
    else:
        print("Exclusão de declaração: Falhou")


with sync_playwright() as p:
    navegador = p.chromium.launch()
    pagina = navegador.new_page()
    login_public(pagina, user, pwd)
    test_nova_declaracao(pagina)
    test_envio_declaracao(pagina)
    test_retificacao(pagina)
    test_exclusao_declaracao(pagina)
