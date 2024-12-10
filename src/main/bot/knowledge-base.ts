interface KnowledgeItem {
  question: string
  answer: string
  keywords: string[]
}

export class KnowledgeBase {
  private static instance: KnowledgeBase
  private knowledge: KnowledgeItem[] = []

  private constructor() {
    // 初始化一些示例知识
    this.knowledge = [
      {
        question: '你是谁',
        answer: '我是一个智能助手，可以帮你回答问题。',
        keywords: ['你是谁', '你是什么', '介绍']
      }
    ]
  }

  public static getInstance(): KnowledgeBase {
    if (!KnowledgeBase.instance) {
      KnowledgeBase.instance = new KnowledgeBase()
    }
    return KnowledgeBase.instance
  }

  public findAnswer(message: string): string | null {
    // 简单的关键词匹配
    const item = this.knowledge.find((item) =>
      item.keywords.some((keyword) => message.includes(keyword))
    )
    return item ? item.answer : null
  }

  public addKnowledge(item: KnowledgeItem): void {
    this.knowledge.push(item)
  }
}
