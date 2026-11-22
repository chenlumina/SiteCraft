/**
 * 「资料」Tab：React Hook Form + zodResolver 的受控表单（规范强制选型）。
 * 数据流：store.data 提供 defaultValues → 用户输入 → watch 订阅把最新值
 * 同步回 store.updateData → 右侧预览即时刷新。表单只 owns 输入体验与校验，
 * 全局唯一状态源仍是 Zustand store。
 * mode:'onBlur' 让错误提示在失焦时出现，避免边打字边报红的干扰。
 */
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Github, Globe, Link2, Mail, MapPin, Tv } from 'lucide-react'
import type { BasicInfoValues } from '@/lib/validators/site-schema'
import { basicInfoSchema } from '@/lib/validators/site-schema'
import { useEditorStore } from '@/lib/stores/editor-store'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FieldError, FormSection } from '@/components/editor/form-section'

export function BasicInfoForm() {
  const data = useEditorStore((s) => s.data)
  const updateData = useEditorStore((s) => s.updateData)

  const {
    register,
    watch,
    formState: { errors },
  } = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: data.name,
      title: data.title,
      status: data.status,
      bio: data.bio,
      avatar: data.avatar,
      location: data.location,
      email: data.email,
      socials: data.socials,
    },
    mode: 'onBlur',
  })

  // 订阅表单值变化并写回 store；返回 unsubscribe 防止组件卸载后内存泄漏
  useEffect(() => {
    const subscription = watch((values) => {
      updateData(values as BasicInfoValues)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateData])

  const bioLength = watch('bio')?.length ?? 0

  return (
    <div className="space-y-4">
      <FormSection title="基本信息" description="展示在官网首屏的核心资料">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="field-name">姓名 *</Label>
              <Input
                id="field-name"
                className="mt-1.5"
                placeholder="你的姓名"
                {...register('name')}
              />
              <FieldError message={errors.name?.message} />
            </div>
            <div>
              <Label htmlFor="field-location">所在地</Label>
              <div className="relative mt-1.5">
                <MapPin className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="field-location"
                  className="pl-8"
                  placeholder="城市 · 国家"
                  {...register('location')}
                />
              </div>
              <FieldError message={errors.location?.message} />
            </div>
          </div>
          <div>
            <Label htmlFor="field-title">头衔 *</Label>
            <Input
              id="field-title"
              className="mt-1.5"
              placeholder="例如：全栈工程师 · 开源爱好者"
              {...register('title')}
            />
            <FieldError message={errors.title?.message} />
          </div>
          <div>
            <Label htmlFor="field-status">当前状态</Label>
            <Input
              id="field-status"
              className="mt-1.5"
              placeholder="例如：正在寻找实习机会"
              {...register('status')}
            />
            <FieldError message={errors.status?.message} />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="field-bio">个人简介</Label>
              <span className="text-xs text-muted-foreground">{bioLength}/600</span>
            </div>
            <Textarea
              id="field-bio"
              className="mt-1.5"
              rows={4}
              placeholder="用两三句话介绍你自己、你的专注方向与热情所在"
              {...register('bio')}
            />
            <FieldError message={errors.bio?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="field-email">邮箱</Label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="field-email"
                  className="pl-8"
                  placeholder="you@example.com"
                  {...register('email')}
                />
              </div>
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <Label htmlFor="field-avatar">头像 URL</Label>
              <div className="relative mt-1.5">
                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="field-avatar"
                  className="pl-8"
                  placeholder="https:// 或 /images/..."
                  {...register('avatar')}
                />
              </div>
              <FieldError message={errors.avatar?.message} />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="社交链接" description="留空即不展示，仅支持 http(s) 链接">
        <div className="space-y-3">
          <div>
            <Label htmlFor="field-github">GitHub</Label>
            <div className="relative mt-1.5">
              <Github className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field-github"
                className="pl-8"
                placeholder="https://github.com/username"
                {...register('socials.github')}
              />
            </div>
            <FieldError message={errors.socials?.github?.message} />
          </div>
          <div>
            <Label htmlFor="field-twitter">X / Twitter</Label>
            <div className="relative mt-1.5">
              <Tv className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field-twitter"
                className="pl-8"
                placeholder="https://x.com/username"
                {...register('socials.twitter')}
              />
            </div>
            <FieldError message={errors.socials?.twitter?.message} />
          </div>
          <div>
            <Label htmlFor="field-bilibili">哔哩哔哩</Label>
            <div className="relative mt-1.5">
              <Tv className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field-bilibili"
                className="pl-8"
                placeholder="https://space.bilibili.com/..."
                {...register('socials.bilibili')}
              />
            </div>
            <FieldError message={errors.socials?.bilibili?.message} />
          </div>
          <div>
            <Label htmlFor="field-website">个人网站</Label>
            <div className="relative mt-1.5">
              <Globe className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="field-website"
                className="pl-8"
                placeholder="https://your-blog.com"
                {...register('socials.website')}
              />
            </div>
            <FieldError message={errors.socials?.website?.message} />
          </div>
        </div>
      </FormSection>
    </div>
  )
}
