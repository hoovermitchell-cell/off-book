// Load order from design/board.css: tokens, chessground base, board theme.
import '../design/tokens.css';
import 'chessground/assets/chessground.base.css';
import '../design/board.css';
import './ui/app.css';
import { mountDrill } from './ui/drill-view';
import { mountFooter } from './ui/footer';

mountDrill(document.getElementById('app')!);
mountFooter(document.getElementById('footer')!);
