/* histórico agrupado pelo dia */
import { HistoryDTO } from './HistoryDTO';

export type HistoryByDayDTO = {
  title: string;
  data: HistoryDTO[];
}
