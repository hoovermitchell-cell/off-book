// Load order from design/board.css: tokens, chessground base, board theme.
import '../design/tokens.css';
import 'chessground/assets/chessground.base.css';
import '../design/board.css';
import './ui/app.css';
import { mountDrill } from './ui/drill-view';

mountDrill(document.getElementById('app')!);
