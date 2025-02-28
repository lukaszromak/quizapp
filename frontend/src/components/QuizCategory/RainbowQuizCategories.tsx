import { useAppSelector } from "store";

import { QuizCategory } from "types"

function RainbowQuizCategories({ categories, className }: { categories: Array<QuizCategory>, className?: string }) {
    const colorMap = useAppSelector(x => x.quizCategory.colorMap)

    const getColor = (id: number): string => {
      const idx = colorMap.findIndex(x => x.split(':')[0] == id.toString())

      if(idx != -1) {
        return `text-white ${colorMap[idx].split(":")[1]}`
      }

      return `text-black bg-black`
    }

    return (
        <div className="max-w-100 flex flex-column flex-wrap gap-1">
        {categories?.map((category, idx) => (
          <span key={idx} className={`${getColor(category.id)} p-2 border rounded font-medium ${className}`}>{category.name}</span>
        ))}
      </div>
    )
}

export default RainbowQuizCategories