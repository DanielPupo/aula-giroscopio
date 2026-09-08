# Aula de Giroscópio com React Native + Expo

Este projeto é uma aplicação mobile desenvolvida em React Native com Expo para demonstrar o uso do giroscópio do dispositivo por meio de três modos de interação: jogo, laboratório e painel de dados.

A ideia principal é transformar a leitura dos sensores em experiências visuais e educativas, permitindo que o usuário veja em tempo real como o movimento do celular afeta os valores de aceleração angular e como isso pode ser interpretado em uma interface.

---

## Objetivo do projeto

O app foi criado para:

- explorar o sensor de giroscópio com `expo-sensors`;
- mostrar como valores de `x`, `y` e `z` mudam conforme o aparelho é movimentado;
- permitir interação em tempo real com o hardware do celular;
- ensinar conceitos básicos de leitura de sensores em ambientes acadêmicos ou de apresentação.

O projeto funciona como uma pequena "aula prática" de sensores, com visualizações interativas e um fluxo de navegação dentro do próprio aplicativo.

---

## Tecnologias utilizadas

- React Native
- Expo
- TypeScript
- Expo Router
- `expo-sensors`
- React Native StyleSheet

### Bibliotecas principais

- `expo-sensors`: responsável por acessar o giroscópio do aparelho.
- `expo-router`: utilizado para gerenciamento de rotas do aplicativo.
- `react-native`: base para a criação da interface mobile.

---

## Estrutura do projeto

```text
.
├── app/
│   ├── _layout.tsx
│   └── index.tsx
├── components/
│   ├── Game.tsx
│   ├── GameMode.tsx
│   ├── DataMode.tsx
│   ├── LabMode.tsx
│   ├── Navigation.tsx
│   ├── Orbe.tsx
│   └── LeituraGiroscopio.tsx
├── assets/
├── app.json
├── eslint.config.js
├── expo-env.d.ts
├── package.json
├── tsconfig.json
├── README.md
└── node_modules/
```

### Explicação dos principais arquivos

#### `app/index.tsx`
Arquivo inicial da aplicação. Ele renderiza o componente principal `Game`, que é responsável por alternar entre os modos disponíveis.

#### `components/Game.tsx`
Componente central da navegação. Ele mantém o estado do modo atualmente selecionado e decide qual tela será exibida:

- `game`
- `lab`
- `data`

#### `components/Navigation.tsx`
Componente de navegação inferior, com botões para alternar entre os três modos. Ele recebe:

- `currentMode`: o modo ativo
- `onModeChange`: função para alterar o modo selecionado

#### `components/GameMode.tsx`
Modo de jogo. A lógica usa os valores do giroscópio para mover um personagem em uma área de jogo e coletar um orbe azul.

Principais comportamentos:

- o usuário move a peça usando os dados do giroscópio;
- o orbe aparece em uma posição aleatória; 
- quando há colisão, o score aumenta;
- existe controle de pausa e reinicialização;
- há um recorde de pontuação.

#### `components/LabMode.tsx`
Modo de laboratório, mais visual e experimental. A ideia é observar a resposta do sensor em movimento e ajustar a sensibilidade do controle.

Funcionalidades:

- bola que se move conforme o giroscópio;
- rastro de movimento em tempo real;
- ajuste de sensibilidade;
- centralização da bola;
- limpeza do rastro;
- painel visual com valores de `x`, `y` e `z`.

#### `components/DataMode.tsx`
Modo de visualização de dados. Aqui o foco é mostrar os valores do sensor com mais clareza e permitir calibração.

Funcionalidades:

- leitura atual de `x`, `y` e `z`;
- histórico das últimas leituras;
- magnitude do vetor do sensor;
- botão de calibração;
- congelamento da leitura;
- status do sensor.

#### `components/LeituraGiroscopio.tsx`
Arquivo didático, com exemplo simples e comentado, mostrando como captar dados do giroscópio de forma direta.

#### `components/Orbe.tsx`
Componente complementar com uma implementação mais simples de interação com o giroscópio, usado como base de estudo ou referência visual.

---

## Como o giroscópio funciona neste projeto

O giroscópio mede a velocidade angular do aparelho, ou seja, como ele está girando em torno de seus eixos.

No código, a API é usada assim:

```tsx
Gyroscope.addListener(({ x, y, z }) => {
  // processa os dados
});
```

Os valores de `x`, `y` e `z` representam variações angulares em diferentes eixos. Em aplicações reais, isso pode ser usado para:

- detectar movimentação do celular;
- controlar jogos;
- criar experiências de realidade aumentada;
- monitorar orientação de dispositivos.

No app, cada módulo interpreta esses valores de uma forma diferente:

- no jogo: os dados alteram a posição do personagem;
- no laboratório: os dados alteram a bola e o rastro;
- nos dados: os valores são exibidos em painel com histórico e calibração.

---

## Lógica de estado e reatividade

O projeto usa o React Native com estados locais (`useState`) e efeitos colaterais (`useEffect`).

### Exemplo de padrão usado

```tsx
const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

useEffect(() => {
  const subscription = Gyroscope.addListener((data) => {
    setGyroData(data);
  });

  return () => subscription.remove();
}, []);
```

Esse padrão permite que a interface seja atualizada sempre que o sensor envia uma nova leitura.

---

## Fluxo de execução da aplicação

1. O app inicializa em `app/index.tsx`.
2. O componente `Game` determina qual módulo deve aparecer.
3. O módulo selecionado usa `expo-sensors` para escutar o giroscópio.
4. Cada nova leitura atualiza o estado do componente.
5. A interface refaz o render conforme os dados mudam.
6. O usuário interage com o celular para controlar os elementos na tela.

---

## Como executar o projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o projeto

```bash
npx expo start
```

A partir daí, você pode abrir o app em:

- Expo Go no celular;
- emulador Android;
- emulador iOS;
- navegador web, quando suportado.

---

## Requisitos

Para funcionar corretamente, o projeto precisa de um dispositivo com suporte ao giroscópio.

Em alguns emuladores, o sensor pode não estar disponível ou pode exigir configuração especial. Em dispositivos reais, a experiência costuma ser mais fiel.

---

## Observações importantes

### Sensores em emuladores

Emuladores podem não expor corretamente os sensores físicos do celular. Por isso:

- testes em dispositivos reais são recomendados;
- em alguns casos, o app pode mostrar `Giroscópio indisponível`;
- a calibração e a leitura podem variar conforme o hardware do aparelho.

### Limpeza de assinatura

O projeto usa `subscription.remove()` em `useEffect` para evitar vazamento de memória e garantir que o sensor pare de emitir quando a tela for desmontada.

---

## Possíveis melhorias futuras

- adicionar gráficos em tempo real dos eixos `x`, `y`, `z`;
- incluir calibração automática por botão ou por gesto;
- transformar o projeto em um sistema de jogos educativos mais completo;
- criar uma versão com uso de `react-native-reanimated` para efeitos mais fluidos;
- adicionar suporte a outros sensores, como acelerômetro e magnetômetro.

---

## Conclusão

Este projeto funciona como uma demonstração prática de como sensores de movimento podem ser usados em aplicações mobile. Ele une conceitos de React Native, estado reativo, leitura de hardware e interface interativa em um único app didático.

Além de ser útil para aprendizado, ele também serve como base para projetos mais avançados em física, robótica educacional, jogos de movimento, realidade aumentada e interfaces de controle por gestos.

---

## Comandos rápidos

```bash
npm install
npx expo start
```

Se quiser, também é possível rodar o projeto em modo web ou em um emulador específico:

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```
